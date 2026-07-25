import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import {
  category_type,
  product_category,
  warranty_status,
} from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('CreateProductUseCase', () => {
  it('creates an inventory product with a draft warranty and no warranty code', async () => {
    const productsRepository = {
      findByProductCode: jest.fn().mockResolvedValue(null),
      findBySerialNumber: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn().mockResolvedValue(null),
    };
    const prismaService = {
      category: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'category-id',
          type: category_type.PRODUCT,
        }),
      },
      product: {
        create: jest.fn().mockResolvedValue({
          id: 'product-id',
          product_code: 'PRD-2026-ABCDEF',
          slug: 'genuine-battery-pack-prd-2026-abcdef',
          warranty_code: null,
          serial_number: 'SN-001',
          name: 'Genuine Battery Pack',
          category: product_category.SPARE_PART,
          category_id: 'category-id',
          category_ref: {
            id: 'category-id',
            code: 'BATTERY',
            created_at: new Date('2026-07-21T00:00:00.000Z'),
            description: null,
            icon: null,
            image_url: null,
            is_active: true,
            metadata: null,
            name: 'Battery',
            order: 0,
            parent_id: null,
            slug: 'battery',
            type: category_type.PRODUCT,
            updated_at: new Date('2026-07-21T00:00:00.000Z'),
          },
          brand: 'Toyota',
          model: 'Battery Plus',
          manufacture_year: 2026,
          description: null,
          status: 'ACTIVE',
          is_published: true,
          published_at: new Date('2026-07-25T00:00:00.000Z'),
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
    const generateProductCodeUseCase = {
      execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF'),
    };
    const useCase = new CreateProductUseCase(
      prismaService as never,
      productsRepository as never,
      generateProductCodeUseCase as never,
    );

    const result = await useCase.execute({
      brand: 'Toyota',
      category: product_category.SPARE_PART,
      categoryId: 'category-id',
      isPublished: true,
      manufactureYear: 2026,
      model: 'Battery Plus',
      name: 'Genuine Battery Pack',
      serialNumber: 'SN-001',
    });

    expect(generateProductCodeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(prismaService.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          warranty_code: null,
          slug: 'genuine-battery-pack-prd-2026-abcdef',
          category_ref: { connect: { id: 'category-id' } },
          is_published: true,
          ownerships: undefined,
          published_at: expect.any(Date),
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
