import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { product_category, warranty_status } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('CreateProductUseCase', () => {
  const createProductsRepository = () => ({
    findByProductCode: jest.fn(),
    findBySerialNumber: jest.fn(),
    findByWarrantyCode: jest.fn(),
  });

  const createPrismaService = () => ({
    category: {
      findUnique: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
    },
    product: {
      create: jest.fn(),
    },
  });

  const generateWarrantyCodeUseCase = {
    execute: jest.fn(),
  };

  it('creates product ownership for a customer without a login account', async () => {
    const productsRepository = createProductsRepository();
    productsRepository.findByProductCode.mockResolvedValue(null);
    productsRepository.findByWarrantyCode.mockResolvedValue(null);
    const prismaService = createPrismaService();
    prismaService.customer.findUnique.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
    });
    prismaService.product.create.mockResolvedValue({
      id: 'product-id',
      product_code: 'PRD-2026-ABCDEF',
      warranty_code: 'WM-2026-WALKIN1',
      serial_number: 'SN-WALKIN-BATTERY-001',
      name: 'Genuine Battery Pack',
      category: product_category.SPARE_PART,
      category_id: null,
      brand: 'Toyota',
      model: 'Battery Plus',
      manufacture_year: 2026,
      description: null,
      status: 'ACTIVE',
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
      deleted_at: null,
      ownerships: [
        {
          id: 'ownership-id',
          product_id: 'product-id',
          customer_id: 'customer-id',
          owner_user_id: null,
          purchase_date: new Date('2026-07-01T00:00:00.000Z'),
          activated_at: new Date('2026-07-01T00:00:00.000Z'),
          ended_at: null,
          is_current_owner: true,
          created_at: new Date('2026-07-09T00:00:00.000Z'),
          updated_at: new Date('2026-07-09T00:00:00.000Z'),
          customer: {
            id: 'customer-id',
            user_id: null,
            customer_code: 'CUS-WALKIN-001',
            full_name: 'Le Thi Minh',
            phone: '0900000003',
            email: 'walkin.customer@example.com',
            address: 'Da Nang',
            metadata: null,
            created_at: new Date('2026-07-09T00:00:00.000Z'),
            updated_at: new Date('2026-07-09T00:00:00.000Z'),
          },
        },
      ],
      warranty: {
        id: 'warranty-id',
        product_id: 'product-id',
        warranty_code: 'WM-2026-WALKIN1',
        start_date: new Date('2026-07-01T00:00:00.000Z'),
        end_date: new Date('2028-07-01T00:00:00.000Z'),
        duration_months: 24,
        status: warranty_status.ACTIVE,
        terms: null,
        metadata: null,
        created_at: new Date('2026-07-09T00:00:00.000Z'),
        updated_at: new Date('2026-07-09T00:00:00.000Z'),
      },
    });
    const useCase = new CreateProductUseCase(
      prismaService as never,
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
    );

    const result = await useCase.execute({
      autoGenerateWarrantyCode: false,
      brand: 'Toyota',
      category: product_category.SPARE_PART,
      customerId: 'customer-id',
      durationMonths: 24,
      manufactureYear: 2026,
      model: 'Battery Plus',
      name: 'Genuine Battery Pack',
      purchaseDate: '2026-07-01T00:00:00.000Z',
      serialNumber: 'SN-WALKIN-BATTERY-001',
      warrantyCode: 'WM-2026-WALKIN1',
    });

    expect(prismaService.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerships: {
            create: expect.objectContaining({
              customer: { connect: { id: 'customer-id' } },
              owner_user: undefined,
              is_current_owner: true,
            }),
          },
        }),
      }),
    );
    expect(result.owner).toEqual(
      expect.objectContaining({
        customerId: 'customer-id',
        ownerUserId: null,
        customerCode: 'CUS-WALKIN-001',
        fullName: 'Le Thi Minh',
      }),
    );
  });
});
