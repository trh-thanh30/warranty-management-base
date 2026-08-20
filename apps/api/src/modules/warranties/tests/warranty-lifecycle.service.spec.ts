import { BadRequestError } from '@/common/response';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import {
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

describe('WarrantyLifecycleService', () => {
  const service = new WarrantyLifecycleService();

  function createTransaction() {
    return {
      productOwnership: {
        update: jest.fn(),
      },
      warranty: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        updateMany: jest.fn(),
      },
      warrantyActivationRequest: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      warrantyActivationRequestItem: {
        updateMany: jest.fn(),
      },
      warrantyClaim: {
        count: jest.fn(),
      },
    };
  }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-23T08:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('activates a draft warranty and records the actor and owner activation', async () => {
    const tx = createTransaction();
    const activatedWarranty = { id: 'warranty-id', status: 'ACTIVE' };
    tx.warranty.findUnique.mockResolvedValue({
      id: 'warranty-id',
      duration_months: 12,
      status: warranty_status.DRAFT,
      warranty_code: 'WM-001',
      product: { ownerships: [{ id: 'ownership-id' }] },
    });
    tx.warranty.updateMany.mockResolvedValue({ count: 1 });
    tx.warranty.findUniqueOrThrow.mockResolvedValue(activatedWarranty);

    const result = await service.activateDraftWarranty(tx as never, {
      activatedByUserId: 'admin-id',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      warrantyId: 'warranty-id',
    });

    expect(tx.warranty.updateMany).toHaveBeenCalledWith({
      where: { id: 'warranty-id', status: warranty_status.DRAFT },
      data: {
        activated_by_id: 'admin-id',
        end_date: new Date('2027-07-01T00:00:00.000Z'),
        start_date: new Date('2026-07-01T00:00:00.000Z'),
        status: warranty_status.ACTIVE,
      },
    });
    expect(tx.productOwnership.update).toHaveBeenCalledWith({
      where: { id: 'ownership-id' },
      data: { activated_at: new Date('2026-07-01T00:00:00.000Z') },
    });
    expect(result).toBe(activatedWarranty);
  });

  it('rejects activation when the warranty has no current owner', async () => {
    const tx = createTransaction();
    tx.warranty.findUnique.mockResolvedValue({
      id: 'warranty-id',
      duration_months: 12,
      status: warranty_status.DRAFT,
      warranty_code: 'WM-001',
      product: { ownerships: [] },
    });

    await expect(
      service.activateDraftWarranty(tx as never, {
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(tx.warranty.updateMany).not.toHaveBeenCalled();
  });

  it('rejects activation from a non-draft status', async () => {
    const tx = createTransaction();
    tx.warranty.findUnique.mockResolvedValue({
      id: 'warranty-id',
      status: warranty_status.ACTIVE,
      product: { ownerships: [{ id: 'ownership-id' }] },
    });

    await expect(
      service.activateDraftWarranty(tx as never, {
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(tx.warranty.updateMany).not.toHaveBeenCalled();
  });

  it('rejects activation with a future start date', async () => {
    const tx = createTransaction();
    tx.warranty.findUnique.mockResolvedValue({
      id: 'warranty-id',
      duration_months: 12,
      status: warranty_status.DRAFT,
      warranty_code: 'WM-001',
      product: { ownerships: [{ id: 'ownership-id' }] },
    });

    await expect(
      service.activateDraftWarranty(tx as never, {
        startDate: new Date('2026-07-24T00:00:00.000Z'),
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(tx.warranty.updateMany).not.toHaveBeenCalled();
  });

  it('voids an active warranty and cancels outstanding activation requests', async () => {
    const tx = createTransaction();
    const voidedWarranty = { id: 'warranty-id', status: 'VOIDED' };
    tx.warranty.findUnique.mockResolvedValue({
      id: 'warranty-id',
      status: warranty_status.ACTIVE,
      warranty_code: 'WM-001',
    });
    tx.warrantyClaim.count.mockResolvedValue(0);
    tx.warranty.updateMany.mockResolvedValue({ count: 1 });
    tx.warranty.findUniqueOrThrow.mockResolvedValue(voidedWarranty);
    tx.warrantyActivationRequest.findMany.mockResolvedValue([
      { id: 'request-id' },
    ]);

    const result = await service.voidWarranty(tx as never, {
      reason: '  Duplicate warranty  ',
      voidedByUserId: 'admin-id',
      warrantyId: 'warranty-id',
    });

    expect(tx.warranty.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: warranty_status.VOIDED,
          void_reason: 'Duplicate warranty',
          voided_by_id: 'admin-id',
        }),
      }),
    );
    expect(tx.warrantyActivationRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['request-id'] } },
      }),
    );
    expect(tx.warrantyActivationRequestItem.updateMany).toHaveBeenCalledWith({
      where: { request_id: { in: ['request-id'] } },
      data: { status: warranty_activation_request_status.CANCELLED },
    });
    expect(result).toBe(voidedWarranty);
  });

  it('rejects voiding while the warranty has open claims', async () => {
    const tx = createTransaction();
    tx.warranty.findUnique.mockResolvedValue({
      id: 'warranty-id',
      status: warranty_status.ACTIVE,
      warranty_code: 'WM-001',
    });
    tx.warrantyClaim.count.mockResolvedValue(2);

    await expect(
      service.voidWarranty(tx as never, {
        reason: 'Invalid registration',
        voidedByUserId: 'admin-id',
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(tx.warranty.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a blank void reason before loading the warranty', async () => {
    const tx = createTransaction();

    await expect(
      service.voidWarranty(tx as never, {
        reason: '   ',
        voidedByUserId: 'admin-id',
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(tx.warranty.findUnique).not.toHaveBeenCalled();
  });

  it.each([warranty_status.EXPIRED, warranty_status.VOIDED])(
    'rejects voiding from %s',
    async (status) => {
      const tx = createTransaction();
      tx.warranty.findUnique.mockResolvedValue({
        id: 'warranty-id',
        status,
        warranty_code: 'WM-001',
      });

      await expect(
        service.voidWarranty(tx as never, {
          reason: 'Invalid registration',
          voidedByUserId: 'admin-id',
          warrantyId: 'warranty-id',
        }),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(tx.warrantyClaim.count).not.toHaveBeenCalled();
    },
  );
});
