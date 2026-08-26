import { NotFoundError } from '@/common/response';
import { ActivateProductWarrantyUseCase } from '@/modules/warranties/use-cases/activate-product-warranty.use-case';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { VoidWarrantyUseCase } from '@/modules/warranties/use-cases/void-warranty.use-case';
import type { WarrantyStatus } from '@/modules/warranties/warranties.types';
import { warranty_status } from '@prisma/client';

function createWarranty(status: WarrantyStatus) {
  return {
    id: 'warranty-id',
    productId: 'product-id',
    warrantyCode: 'WM-001',
    startDate: new Date('2026-07-01T00:00:00.000Z'),
    endDate: new Date('2027-07-01T00:00:00.000Z'),
    durationMonths: 12,
    coverageLimitAmount: null,
    maxClaimCount: null,
    maxAmountPerClaim: null,
    status,
    terms: null,
    metadata: null,
    activatedById: null,
    voidedAt: null,
    voidedById: null,
    voidReason: null,
    createdAt: new Date('2026-07-01T00:00:00.000Z'),
    updatedAt: new Date('2026-07-01T00:00:00.000Z'),
  };
}

describe('Warranty write use cases', () => {
  it('activates inside a repository transaction and issues after commit', async () => {
    const transactionRepository = {};
    const activatedWarranty = createWarranty(warranty_status.ACTIVE);
    const warrantiesRepository = {
      withTransaction: jest.fn(async (operation) =>
        operation(transactionRepository),
      ),
    };
    const lifecycleService = {
      activateDraftWarranty: jest.fn().mockResolvedValue(activatedWarranty),
    };
    const certificateUseCase = { execute: jest.fn().mockResolvedValue({}) };
    const useCase = new ActivateWarrantyUseCase(
      warrantiesRepository as never,
      lifecycleService as never,
      certificateUseCase as never,
    );

    const result = await useCase.execute(
      'warranty-id',
      { startDate: '2026-07-01T00:00:00.000Z' },
      { activatedByUserId: 'admin-id' },
    );

    expect(lifecycleService.activateDraftWarranty).toHaveBeenCalledWith(
      transactionRepository,
      {
        activatedByUserId: 'admin-id',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        warrantyId: 'warranty-id',
      },
    );
    expect(certificateUseCase.execute).toHaveBeenCalledWith({
      warrantyId: 'warranty-id',
    });
    expect(
      warrantiesRepository.withTransaction.mock.invocationCallOrder[0],
    ).toBeLessThan(certificateUseCase.execute.mock.invocationCallOrder[0]);
    expect(result.status).toBe(warranty_status.ACTIVE);
  });

  it('does not issue a certificate when activation rolls back', async () => {
    const transactionError = new Error('transaction failed');
    const warrantiesRepository = {
      withTransaction: jest.fn().mockRejectedValue(transactionError),
    };
    const lifecycleService = { activateDraftWarranty: jest.fn() };
    const certificateUseCase = { execute: jest.fn() };
    const useCase = new ActivateWarrantyUseCase(
      warrantiesRepository as never,
      lifecycleService as never,
      certificateUseCase as never,
    );

    await expect(useCase.execute('warranty-id', {})).rejects.toBe(
      transactionError,
    );
    expect(certificateUseCase.execute).not.toHaveBeenCalled();
  });

  it('voids a warranty inside the repository transaction', async () => {
    const transactionRepository = {};
    const voidedWarranty = createWarranty(warranty_status.VOIDED);
    const warrantiesRepository = {
      withTransaction: jest.fn(async (operation) =>
        operation(transactionRepository),
      ),
    };
    const lifecycleService = {
      voidWarranty: jest.fn().mockResolvedValue(voidedWarranty),
    };
    const useCase = new VoidWarrantyUseCase(
      warrantiesRepository as never,
      lifecycleService as never,
    );

    const result = await useCase.execute(
      'warranty-id',
      { reason: 'Duplicate warranty' },
      { voidedByUserId: 'admin-id' },
    );

    expect(lifecycleService.voidWarranty).toHaveBeenCalledWith(
      transactionRepository,
      {
        reason: 'Duplicate warranty',
        voidedByUserId: 'admin-id',
        warrantyId: 'warranty-id',
      },
    );
    expect(result.status).toBe(warranty_status.VOIDED);
  });

  it('resolves a product warranty before delegating activation', async () => {
    const warrantiesRepository = {
      findByProductId: jest.fn().mockResolvedValue({ id: 'warranty-id' }),
    };
    const activateWarrantyUseCase = {
      execute: jest.fn().mockResolvedValue({ status: warranty_status.ACTIVE }),
    };
    const useCase = new ActivateProductWarrantyUseCase(
      warrantiesRepository as never,
      activateWarrantyUseCase as never,
    );

    await useCase.execute(
      'product-id',
      { startDate: '2026-07-01T00:00:00.000Z' },
      { activatedByUserId: 'admin-id' },
    );

    expect(activateWarrantyUseCase.execute).toHaveBeenCalledWith(
      'warranty-id',
      { startDate: '2026-07-01T00:00:00.000Z' },
      { activatedByUserId: 'admin-id' },
    );
  });

  it('rejects product activation when no warranty exists', async () => {
    const warrantiesRepository = {
      findByProductId: jest.fn().mockResolvedValue(null),
    };
    const activateWarrantyUseCase = { execute: jest.fn() };
    const useCase = new ActivateProductWarrantyUseCase(
      warrantiesRepository as never,
      activateWarrantyUseCase as never,
    );

    await expect(useCase.execute('product-id', {})).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(activateWarrantyUseCase.execute).not.toHaveBeenCalled();
  });
});
