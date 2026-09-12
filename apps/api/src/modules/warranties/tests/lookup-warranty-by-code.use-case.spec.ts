import { NotFoundError } from '@/common/response';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';

describe('LookupWarrantyByCodeUseCase', () => {
  const warrantiesRepository = {
    findByWarrantyCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns warranty details for an active product matching the code', async () => {
    const startDate = new Date('2026-06-14T00:00:00.000Z');
    const endDate = new Date('2029-06-14T00:00:00.000Z');
    const installedAt = new Date('2026-06-10T00:00:00.000Z');

    warrantiesRepository.findByWarrantyCode.mockResolvedValue({
      id: 'warranty-id',
      warranty_code: 'WM-2026-ABCDEF',
      serial_number: 'VIN123',
      start_date: startDate,
      end_date: endDate,
      duration_months: 36,
      terms: 'Bảo hành chính hãng theo điều kiện công bố.',
      status: 'ACTIVE',
      activation_code: { code_ciphertext: 'encrypted-code' },
      product: {
        id: 'product-id',
        product_code: 'LEX-SP50-001',
        display_name: 'Toyota Camry',
        slug: 'toyota-camry',
        brand: 'Toyota',
        model: 'Camry',
        category_ref: {
          id: 'category-id',
          name: 'Phim cách nhiệt',
          slug: 'phim-cach-nhiet',
        },
      },
      activation_request: {
        installed_at: installedAt,
        vehicle_model: 'Toyota Camry',
        vehicle_plate: '30H-888.88',
        customer_name: 'Nguyễn Văn An',
        customer_phone: '0988123456',
        full_address: 'Địa chỉ khách hàng',
        metadata: {
          dealer: {
            id: 'dealer-id',
            name: 'FUJITEK Hà Nội',
            phone: '19009169',
            address: '62 Nghĩa Đô',
            province: 'Hà Nội',
            district: 'Cầu Giấy',
          },
          filmItems: {
            windshield: 'SP50',
            frontLeftSide: 'SP30',
            ignoredValue: 123,
          },
          internalNote: 'Không được public',
        },
      },
    });
    const useCase = new LookupWarrantyByCodeUseCase(
      warrantiesRepository as never,
      undefined,
      { decrypt: jest.fn().mockReturnValue('SP-ABCDEF123456') } as never,
    );

    const result = await useCase.execute({ code: 'wm-2026-abcdef' });

    expect(warrantiesRepository.findByWarrantyCode).toHaveBeenCalledWith(
      'WM-2026-ABCDEF',
    );
    expect(result).toEqual({
      product: {
        id: 'product-id',
        productCode: 'LEX-SP50-001',
        name: 'Toyota Camry',
        displayName: 'Toyota Camry',
        brand: 'Toyota',
        model: 'Camry',
        serialNumber: 'VIN123',
        warrantyCode: 'WM-2026-ABCDEF',
        category: {
          id: 'category-id',
          name: 'Phim cách nhiệt',
          slug: 'phim-cach-nhiet',
        },
      },
      warranty: {
        activationCode: 'SP-ABCDEF123456',
        warrantyCode: 'WM-2026-ABCDEF',
        startDate,
        endDate,
        durationMonths: 36,
        terms: 'Bảo hành chính hãng theo điều kiện công bố.',
        status: 'ACTIVE',
      },
      installation: {
        installedAt: startDate,
        vehicleModel: 'Toyota Camry',
        dealer: {
          id: 'dealer-id',
          name: 'FUJITEK Hà Nội',
          phone: '19009169',
          address: '62 Nghĩa Đô',
          province: 'Hà Nội',
          district: 'Cầu Giấy',
        },
        filmItems: {
          windshield: 'SP50',
          frontLeftSide: 'SP30',
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /Nguyễn Văn An|0988123456|30H-888\.88|Địa chỉ khách hàng|internalNote/,
    );
  });

  it('throws not found when no non-deleted product warranty matches', async () => {
    warrantiesRepository.findByWarrantyCode.mockResolvedValue(null);
    const useCase = new LookupWarrantyByCodeUseCase(
      warrantiesRepository as never,
    );

    await expect(
      useCase.execute({ code: 'WM-2026-MISSING' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
