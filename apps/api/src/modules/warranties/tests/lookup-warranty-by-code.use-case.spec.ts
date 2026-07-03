import { NotFoundError } from '@/common/response';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';

describe('LookupWarrantyByCodeUseCase', () => {
  const warrantiesRepository = {
    findActiveProductByWarrantyCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns warranty details for an active product matching the code', async () => {
    warrantiesRepository.findActiveProductByWarrantyCode.mockResolvedValue({
      id: 'product-id',
      name: 'Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
      serial_number: 'VIN123',
      warranty_code: 'WM-2026-ABCDEF',
      warranty: {
        warranty_code: 'WM-2026-ABCDEF',
        start_date: new Date('2026-06-14T00:00:00.000Z'),
        end_date: new Date('2029-06-14T00:00:00.000Z'),
        status: 'ACTIVE',
      },
    });
    const useCase = new LookupWarrantyByCodeUseCase(
      warrantiesRepository as never,
    );

    const result = await useCase.execute({ code: 'wm-2026-abcdef' });

    expect(
      warrantiesRepository.findActiveProductByWarrantyCode,
    ).toHaveBeenCalledWith('WM-2026-ABCDEF');
    expect(result.product.id).toBe('product-id');
    expect(result.warranty.warrantyCode).toBe('WM-2026-ABCDEF');
  });

  it('throws not found when no non-deleted product warranty matches', async () => {
    warrantiesRepository.findActiveProductByWarrantyCode.mockResolvedValue(
      null,
    );
    const useCase = new LookupWarrantyByCodeUseCase(
      warrantiesRepository as never,
    );

    await expect(
      useCase.execute({ code: 'WM-2026-MISSING' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
