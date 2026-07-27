import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateWarrantyUseCase } from '@/modules/warranties/use-cases/update-warranty.use-case';
import { Prisma, warranty_status } from '@prisma/client';

describe('UpdateWarrantyUseCase', () => {
  const repository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates coverage limits and recalculates an active warranty end date', async () => {
    const warranty = createWarranty();
    repository.findById.mockResolvedValue(warranty);
    repository.update.mockImplementation(
      (_id: string, data: Record<string, unknown>) => ({
        ...warranty,
        coverage_limit_amount: data.coverage_limit_amount,
        duration_months: data.duration_months,
        end_date: data.end_date,
        max_amount_per_claim: data.max_amount_per_claim,
        max_claim_count: data.max_claim_count,
        metadata: data.metadata,
        terms: data.terms,
      }),
    );
    const useCase = new UpdateWarrantyUseCase(repository as never);

    const result = await useCase.execute(
      warranty.id,
      {
        adjustmentReason: 'Gia han theo chinh sach moi',
        coverageLimitAmount: '50000000.00',
        durationMonths: 24,
        maxAmountPerClaim: '10000000',
        maxClaimCount: 3,
        terms: 'Dieu khoan cap nhat',
      },
      { adjustedByUserId: 'admin-id' },
    );

    expect(repository.update).toHaveBeenCalledWith(
      warranty.id,
      expect.objectContaining({
        coverage_limit_amount: new Prisma.Decimal('50000000.00'),
        duration_months: 24,
        end_date: new Date('2028-01-15T00:00:00.000Z'),
        max_amount_per_claim: new Prisma.Decimal('10000000'),
        max_claim_count: 3,
        terms: 'Dieu khoan cap nhat',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        coverageLimitAmount: '50000000',
        durationMonths: 24,
        maxAmountPerClaim: '10000000',
        maxClaimCount: 3,
      }),
    );
  });

  it.each([warranty_status.EXPIRED, warranty_status.VOIDED])(
    'rejects adjustments for a %s warranty',
    async (status) => {
      repository.findById.mockResolvedValue(createWarranty({ status }));
      const useCase = new UpdateWarrantyUseCase(repository as never);

      await expect(
        useCase.execute('warranty-id', {
          adjustmentReason: 'Khong con hop le',
          durationMonths: 12,
        }),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(repository.update).not.toHaveBeenCalled();
    },
  );

  it('rejects a per-claim amount above the total coverage limit', async () => {
    repository.findById.mockResolvedValue(createWarranty());
    const useCase = new UpdateWarrantyUseCase(repository as never);

    await expect(
      useCase.execute('warranty-id', {
        adjustmentReason: 'Cap nhat han muc',
        coverageLimitAmount: '1000000',
        maxAmountPerClaim: '2000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects an adjustment without mutable fields', async () => {
    repository.findById.mockResolvedValue(createWarranty());
    const useCase = new UpdateWarrantyUseCase(repository as never);

    await expect(
      useCase.execute('warranty-id', {
        adjustmentReason: 'Khong co thay doi',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws not found for an absent warranty', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new UpdateWarrantyUseCase(repository as never);

    await expect(
      useCase.execute('missing-id', {
        adjustmentReason: 'Cap nhat thoi han',
        durationMonths: 12,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

function createWarranty(
  overrides: Partial<ReturnType<typeof createWarrantyBase>> = {},
) {
  return { ...createWarrantyBase(), ...overrides };
}

function createWarrantyBase() {
  return {
    id: 'warranty-id',
    product_id: 'product-id',
    warranty_code: 'WM-2026-ABCDEF',
    start_date: new Date('2026-01-15T00:00:00.000Z'),
    end_date: new Date('2027-01-15T00:00:00.000Z'),
    duration_months: 12,
    coverage_limit_amount: null,
    max_claim_count: null,
    max_amount_per_claim: null,
    status: warranty_status.ACTIVE as warranty_status,
    terms: null,
    metadata: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    product: {
      id: 'product-id',
      product_code: 'PRD-2026-ABCDEF',
      display_name: null,
      serial_number: 'SN-001',
      template: {
        name: 'San pham bao hanh',
        brand: null,
        model: null,
      },
      ownerships: [],
    },
  };
}
