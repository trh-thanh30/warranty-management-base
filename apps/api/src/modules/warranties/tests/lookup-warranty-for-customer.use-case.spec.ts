import { NotFoundError } from '@/common/response';
import { LookupWarrantyForCustomerUseCase } from '@/modules/warranties/use-cases/lookup-warranty-for-customer.use-case';

describe('LookupWarrantyForCustomerUseCase', () => {
  const warrantiesRepository = {
    findLookupMatchForCustomer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns warranty details when the product belongs to the customer', async () => {
    warrantiesRepository.findLookupMatchForCustomer.mockResolvedValue({
      id: 'warranty-id',
      serial_number: 'VIN123',
      warranty_code: 'WM-2026-ABCDEF',
      start_date: new Date('2026-06-14T00:00:00.000Z'),
      end_date: new Date('2029-06-14T00:00:00.000Z'),
      status: 'ACTIVE',
      product: {
        id: 'product-id',
        display_name: null,
        product_code: 'PRD-001',
        slug: 'toyota-camry',
        template: {
          name: 'Toyota Camry',
          brand: 'Toyota',
          model: 'Camry',
        },
      },
    });
    const useCase = new LookupWarrantyForCustomerUseCase(
      warrantiesRepository as never,
    );

    const result = await useCase.execute('owner-user-id', {
      code: 'wm-2026-abcdef',
    });

    expect(
      warrantiesRepository.findLookupMatchForCustomer,
    ).toHaveBeenCalledWith('WM-2026-ABCDEF', 'owner-user-id');
    expect(result.product.id).toBe('product-id');
    expect(result.warranty.warrantyCode).toBe('WM-2026-ABCDEF');
  });

  it('throws the same not-found response when the product is absent or not owned', async () => {
    warrantiesRepository.findLookupMatchForCustomer.mockResolvedValue(null);
    const useCase = new LookupWarrantyForCustomerUseCase(
      warrantiesRepository as never,
    );

    await expect(
      useCase.execute('owner-user-id', { code: 'WM-2026-OTHER1' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
