import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
import { product_category, product_status } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('UpdateProductUseCase', () => {
  it('deletes rich-text media removed from the product description', async () => {
    const product = {
      id: 'product-id',
      product_code: 'PRD-001',
      warranty_code: 'WM-001',
      serial_number: null,
      name: 'Product',
      category: product_category.CAR,
      category_id: null,
      brand: null,
      model: null,
      manufacture_year: null,
      description:
        '<p>Old</p><img src="https://cdn.example.com/rich-text/old.jpg">',
      status: product_status.ACTIVE,
      metadata: null,
      created_at: new Date('2026-07-21T00:00:00.000Z'),
      updated_at: new Date('2026-07-21T00:00:00.000Z'),
      deleted_at: null,
      ownerships: [],
      warranty: null,
    };
    const productsRepository = {
      findById: jest.fn().mockResolvedValue(product),
      findBySerialNumber: jest.fn(),
      update: jest.fn().mockResolvedValue({
        ...product,
        description: '<p>New</p>',
      }),
    };
    const prismaService = {
      category: { findUnique: jest.fn() },
    };
    const assetsService = {
      deleteAssetByUrl: jest.fn().mockResolvedValue(true),
    };
    const useCase = new UpdateProductUseCase(
      prismaService as never,
      productsRepository as never,
      assetsService as never,
    );

    await useCase.execute('product-id', { description: '<p>New</p>' });

    expect(assetsService.deleteAssetByUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/rich-text/old.jpg',
      expect.objectContaining({ folder: 'rich-text' }),
    );
    expect(productsRepository.update).toHaveBeenCalled();
  });
});
