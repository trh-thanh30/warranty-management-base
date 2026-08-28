import { BadRequestError, ConflictError } from '@/common/response';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import {
  warranty_activation_request_status,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';

describe('WarrantyLifecycleService', () => {
  const service = new WarrantyLifecycleService();

  function createRepository() {
    return {
      activateDraftWarranty: jest.fn(),
      cancelActivationRequestItems: jest.fn(),
      cancelActivationRequests: jest.fn(),
      countOpenClaims: jest.fn(),
      findOpenActivationRequestIds: jest.fn(),
      findWarrantyByIdOrThrow: jest.fn(),
      findWarrantyForActivation: jest.fn(),
      findWarrantyForVoid: jest.fn(),
      markOwnershipActivated: jest.fn(),
      voidEligibleWarranty: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-23T08:00:00.000Z'));
  });

  afterEach(() => jest.useRealTimers());

  it('activates a draft warranty and records the actor and owner activation', async () => {
    const repository = createRepository();
    const activatedWarranty = { id: 'warranty-id', status: 'ACTIVE' };
    repository.findWarrantyForActivation.mockResolvedValue({
      id: 'warranty-id',
      currentOwnershipId: 'ownership-id',
      durationMonths: 12,
      status: warranty_status.DRAFT,
      warrantyCode: 'WM-001',
    });
    repository.activateDraftWarranty.mockResolvedValue({ count: 1 });
    repository.findWarrantyByIdOrThrow.mockResolvedValue(activatedWarranty);

    const result = await service.activateDraftWarranty(repository as never, {
      activatedByUserId: 'admin-id',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      warrantyId: 'warranty-id',
    });

    expect(repository.activateDraftWarranty).toHaveBeenCalledWith({
      activatedByUserId: 'admin-id',
      endDate: new Date('2027-07-01T00:00:00.000Z'),
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      warrantyId: 'warranty-id',
    });
    expect(repository.markOwnershipActivated).toHaveBeenCalledWith(
      'ownership-id',
      new Date('2026-07-01T00:00:00.000Z'),
    );
    expect(result).toBe(activatedWarranty);
  });

  it('rejects activation when the warranty has no current owner', async () => {
    const repository = createRepository();
    repository.findWarrantyForActivation.mockResolvedValue({
      id: 'warranty-id',
      currentOwnershipId: null,
      durationMonths: 12,
      status: warranty_status.DRAFT,
      warrantyCode: 'WM-001',
    });

    await expect(
      service.activateDraftWarranty(repository as never, {
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.activateDraftWarranty).not.toHaveBeenCalled();
  });

  it('rejects activation from a non-draft status', async () => {
    const repository = createRepository();
    repository.findWarrantyForActivation.mockResolvedValue({
      id: 'warranty-id',
      currentOwnershipId: 'ownership-id',
      status: warranty_status.ACTIVE,
    });

    await expect(
      service.activateDraftWarranty(repository as never, {
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.activateDraftWarranty).not.toHaveBeenCalled();
  });

  it('rejects activation with a future start date', async () => {
    const repository = createRepository();
    repository.findWarrantyForActivation.mockResolvedValue({
      id: 'warranty-id',
      currentOwnershipId: 'ownership-id',
      durationMonths: 12,
      status: warranty_status.DRAFT,
      warrantyCode: 'WM-001',
    });

    await expect(
      service.activateDraftWarranty(repository as never, {
        startDate: new Date('2026-07-24T00:00:00.000Z'),
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.activateDraftWarranty).not.toHaveBeenCalled();
  });

  it('rejects activation when the guarded transition loses a race', async () => {
    const repository = createRepository();
    repository.findWarrantyForActivation.mockResolvedValue({
      id: 'warranty-id',
      currentOwnershipId: 'ownership-id',
      durationMonths: 12,
      status: warranty_status.DRAFT,
      warrantyCode: 'WM-001',
    });
    repository.activateDraftWarranty.mockResolvedValue({ count: 0 });

    await expect(
      service.activateDraftWarranty(repository as never, {
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repository.markOwnershipActivated).not.toHaveBeenCalled();
  });

  it('voids an active warranty and cancels outstanding activation requests', async () => {
    const repository = createRepository();
    const voidedWarranty = { id: 'warranty-id', status: 'VOIDED' };
    repository.findWarrantyForVoid.mockResolvedValue({
      id: 'warranty-id',
      status: warranty_status.ACTIVE,
      warrantyCode: 'WM-001',
    });
    repository.countOpenClaims.mockResolvedValue(0);
    repository.voidEligibleWarranty.mockResolvedValue({ count: 1 });
    repository.findWarrantyByIdOrThrow.mockResolvedValue(voidedWarranty);
    repository.findOpenActivationRequestIds.mockResolvedValue([
      { id: 'request-id' },
    ]);

    const result = await service.voidWarranty(repository as never, {
      reason: '  Duplicate warranty  ',
      voidedByUserId: 'admin-id',
      warrantyId: 'warranty-id',
    });

    expect(repository.countOpenClaims).toHaveBeenCalledWith('warranty-id', [
      warranty_claim_status.SUBMITTED,
      warranty_claim_status.REVIEWING,
      warranty_claim_status.APPROVED,
      warranty_claim_status.IN_REPAIR,
    ]);
    expect(repository.cancelActivationRequestItems).toHaveBeenCalledWith(
      ['request-id'],
      warranty_activation_request_status.CANCELLED,
    );
    expect(repository.cancelActivationRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        requestIds: ['request-id'],
        reviewedById: 'admin-id',
        status: warranty_activation_request_status.CANCELLED,
      }),
    );
    expect(result).toBe(voidedWarranty);
  });

  it('rejects voiding while the warranty has open claims', async () => {
    const repository = createRepository();
    repository.findWarrantyForVoid.mockResolvedValue({
      id: 'warranty-id',
      status: warranty_status.ACTIVE,
      warrantyCode: 'WM-001',
    });
    repository.countOpenClaims.mockResolvedValue(2);

    await expect(
      service.voidWarranty(repository as never, {
        reason: 'Invalid registration',
        voidedByUserId: 'admin-id',
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.voidEligibleWarranty).not.toHaveBeenCalled();
  });

  it('rejects a blank void reason before loading the warranty', async () => {
    const repository = createRepository();

    await expect(
      service.voidWarranty(repository as never, {
        reason: '   ',
        voidedByUserId: 'admin-id',
        warrantyId: 'warranty-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.findWarrantyForVoid).not.toHaveBeenCalled();
  });

  it.each([warranty_status.EXPIRED, warranty_status.VOIDED])(
    'rejects voiding from %s',
    async (status) => {
      const repository = createRepository();
      repository.findWarrantyForVoid.mockResolvedValue({
        id: 'warranty-id',
        status,
        warrantyCode: 'WM-001',
      });

      await expect(
        service.voidWarranty(repository as never, {
          reason: 'Invalid registration',
          voidedByUserId: 'admin-id',
          warrantyId: 'warranty-id',
        }),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(repository.countOpenClaims).not.toHaveBeenCalled();
    },
  );
});
