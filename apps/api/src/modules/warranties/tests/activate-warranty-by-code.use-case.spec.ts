import { NotFoundError } from '@/common/response';
import { ActivateWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/activate-warranty-by-code.use-case';

describe('ActivateWarrantyByCodeUseCase', () => {
  const prismaService = {
    warranty: {
      update: jest.fn(),
    },
    productOwnership: {
      updateMany: jest.fn(),
    },
  };
  const warrantiesRepository = {
    findActiveProductByWarrantyCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('activates warranty by warranty code and marks current ownership activated', async () => {
    warrantiesRepository.findActiveProductByWarrantyCode.mockResolvedValue({
      id: 'product-id',
      warranty: {
        id: 'warranty-id',
        product_id: 'product-id',
        warranty_code: 'WM-2026-ABCDEF',
        start_date: null,
        end_date: null,
        duration_months: 24,
        status: 'DRAFT',
        terms: 'Old terms',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    });
    prismaService.warranty.update.mockResolvedValue({
      id: 'warranty-id',
      product_id: 'product-id',
      warranty_code: 'WM-2026-ABCDEF',
      start_date: new Date('2026-07-02T00:00:00.000Z'),
      end_date: new Date('2028-07-02T00:00:00.000Z'),
      duration_months: 24,
      status: 'ACTIVE',
      terms: 'New terms',
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-07-02T00:00:00.000Z'),
    });

    const useCase = new ActivateWarrantyByCodeUseCase(
      prismaService as never,
      warrantiesRepository as never,
    );

    const result = await useCase.execute({
      warrantyCode: 'wm-2026-abcdef',
      startDate: '2026-07-02',
      terms: 'New terms',
    });

    expect(
      warrantiesRepository.findActiveProductByWarrantyCode,
    ).toHaveBeenCalledWith('WM-2026-ABCDEF');
    expect(prismaService.warranty.update).toHaveBeenCalledWith({
      where: { id: 'warranty-id' },
      data: expect.objectContaining({
        start_date: new Date('2026-07-02'),
        end_date: new Date('2028-07-02'),
        duration_months: 24,
        status: 'ACTIVE',
        terms: 'New terms',
      }),
    });
    expect(prismaService.productOwnership.updateMany).toHaveBeenCalledWith({
      where: {
        product_id: 'product-id',
        is_current_owner: true,
        activated_at: null,
      },
      data: { activated_at: new Date('2026-07-02') },
    });
    expect(result.status).toBe('ACTIVE');
  });

  it('throws not found when warranty code does not belong to an active product', async () => {
    warrantiesRepository.findActiveProductByWarrantyCode.mockResolvedValue(
      null,
    );
    const useCase = new ActivateWarrantyByCodeUseCase(
      prismaService as never,
      warrantiesRepository as never,
    );

    await expect(
      useCase.execute({ warrantyCode: 'WM-2026-MISSING' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaService.warranty.update).not.toHaveBeenCalled();
  });
});
