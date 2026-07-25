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

  it('updates only physical-unit fields when the product uses a template', async () => {
    const product = {
      id: 'product-id',
      template_id: 'template-id',
      serial_number: 'OLD-SERIAL',
      description: '<p>Template snapshot</p>',
      metadata: { source: 'legacy', installationPosition: 'Old position' },
      deleted_at: null,
    };
    const productsRepository = {
      findById: jest.fn().mockResolvedValue(product),
      findBySerialNumber: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({
        ...product,
        serial_number: 'NEW-SERIAL',
        status: product_status.INACTIVE,
        ownerships: [],
      }),
    };
    const prismaService = {
      category: { findUnique: jest.fn() },
    };
    const assetsService = {
      deleteAssetByUrl: jest.fn(),
    };
    const useCase = new UpdateProductUseCase(
      prismaService as never,
      productsRepository as never,
      assetsService as never,
    );

    await useCase.execute('product-id', {
      name: 'Must not overwrite template-owned data',
      category: product_category.SPARE_PART,
      categoryId: 'category-id',
      description: '<p>Must not be persisted</p>',
      serialNumber: 'NEW-SERIAL',
      status: product_status.INACTIVE,
      metadata: {
        specifications: [{ key: 'Shared', value: 'Ignored' }],
        installationPosition: ' New position ',
      },
    });

    expect(prismaService.category.findUnique).not.toHaveBeenCalled();
    expect(assetsService.deleteAssetByUrl).not.toHaveBeenCalled();
    expect(productsRepository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        name: undefined,
        category: undefined,
        description: undefined,
        serial_number: 'NEW-SERIAL',
        status: product_status.INACTIVE,
        metadata: {
          source: 'legacy',
          installationPosition: 'New position',
        },
      }),
    );
  });
});
