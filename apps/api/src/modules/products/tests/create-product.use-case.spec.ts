import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { product_category, warranty_status } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('CreateProductUseCase', () => {
  it('creates an inventory product with a draft warranty and no warranty code', async () => {
    const productsRepository = {
      findByProductCode: jest.fn().mockResolvedValue(null),
      findBySerialNumber: jest.fn().mockResolvedValue(null),
    };
    const prismaService = {
      category: { findUnique: jest.fn() },
      product: {
        create: jest.fn().mockResolvedValue({
          id: 'product-id',
          product_code: 'PRD-2026-ABCDEF',
          warranty_code: null,
          serial_number: 'SN-001',
          name: 'Genuine Battery Pack',
          category: product_category.SPARE_PART,
          category_id: null,
          brand: 'Toyota',
          model: 'Battery Plus',
          manufacture_year: 2026,
          description: null,
          status: 'ACTIVE',
          metadata: null,
          created_at: new Date('2026-07-21T00:00:00.000Z'),
          updated_at: new Date('2026-07-21T00:00:00.000Z'),
          deleted_at: null,
          assets: [],
          ownerships: [],
          warranty: {
            id: 'warranty-id',
            product_id: 'product-id',
            warranty_code: null,
            start_date: null,
            end_date: null,
            duration_months: 36,
            status: warranty_status.DRAFT,
            terms: null,
            metadata: null,
            created_at: new Date('2026-07-21T00:00:00.000Z'),
            updated_at: new Date('2026-07-21T00:00:00.000Z'),
          },
        }),
      },
    };
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new CreateProductUseCase(
      prismaService as never,
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
    );

    const result = await useCase.execute({
      brand: 'Toyota',
      category: product_category.SPARE_PART,
      manufactureYear: 2026,
      model: 'Battery Plus',
      name: 'Genuine Battery Pack',
      serialNumber: 'SN-001',
    });

    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(prismaService.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          warranty_code: null,
          ownerships: undefined,
          warranty: {
            create: expect.objectContaining({
              warranty_code: null,
              duration_months: 36,
              start_date: null,
              end_date: null,
              status: warranty_status.DRAFT,
            }),
          },
        }),
      }),
    );
    expect(result.warrantyCode).toBeNull();
    expect(result.owner).toBeNull();
    expect(result.warranty).toEqual(
      expect.objectContaining({
        warrantyCode: null,
        status: warranty_status.DRAFT,
      }),
    );
  });
});
