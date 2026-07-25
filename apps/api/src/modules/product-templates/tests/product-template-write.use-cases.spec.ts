import { CreateProductTemplateUseCase } from '@/modules/product-templates/use-cases/create-product-template.use-case';
import { CreateProductTemplateFromProductUseCase } from '@/modules/product-templates/use-cases/create-product-template-from-product.use-case';
import { UpdateProductTemplateUseCase } from '@/modules/product-templates/use-cases/update-product-template.use-case';
import { category_type, product_category } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

const templateRecord = {
  id: 'template-id',
  name: 'PPF X10',
  category: product_category.ACCESSORY,
  category_id: 'category-id',
  category_ref: null,
  brand: '3M',
  model: 'X10',
  manufacture_year: null,
  description: null,
  default_warranty_duration_months: 36,
  default_warranty_terms: null,
  metadata: null,
  is_active: true,
  created_at: new Date('2026-07-25T00:00:00.000Z'),
  updated_at: new Date('2026-07-25T00:00:00.000Z'),
  assets: [],
  _count: { products: 0 },
};

describe('ProductTemplate write use cases', () => {
  it('creates a reusable template with validated image assets', async () => {
    const repository = {
      findImageAssets: jest
        .fn()
        .mockResolvedValue([{ id: 'cover-id' }, { id: 'gallery-id' }]),
      create: jest.fn().mockResolvedValue(templateRecord),
    };
    const useCase = new CreateProductTemplateUseCase(
      {
        category: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'category-id',
            type: category_type.PRODUCT,
          }),
        },
      } as never,
      repository as never,
      { enrichAssetUrl: jest.fn() } as never,
    );

    await useCase.execute({
      name: 'PPF X10',
      category: product_category.ACCESSORY,
      categoryId: 'category-id',
      coverAssetId: 'cover-id',
      galleryAssetIds: ['gallery-id'],
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        assets: {
          create: [
            expect.objectContaining({ role: 'COVER' }),
            expect.objectContaining({ role: 'GALLERY' }),
          ],
        },
      }),
    );
  });

  it('updates template-owned media without touching physical product media', async () => {
    const existingTemplate = {
      ...templateRecord,
      assets: [
        {
          asset_id: 'old-cover-id',
          role: 'COVER',
        },
      ],
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(existingTemplate),
      findImageAssets: jest.fn().mockResolvedValue([{ id: 'new-cover-id' }]),
      update: jest.fn().mockResolvedValue(templateRecord),
    };
    const assetsService = {
      deleteAssetIfUnreferenced: jest.fn().mockResolvedValue(true),
      enrichAssetUrl: jest.fn(),
    };
    const useCase = new UpdateProductTemplateUseCase(
      {
        category: { findUnique: jest.fn() },
      } as never,
      repository as never,
      assetsService as never,
    );

    await useCase.execute('template-id', { coverAssetId: 'new-cover-id' });

    expect(repository.update).toHaveBeenCalledWith(
      'template-id',
      expect.any(Object),
      { coverAssetId: 'new-cover-id' },
    );
    expect(assetsService.deleteAssetIfUnreferenced).toHaveBeenCalledWith(
      'old-cover-id',
    );
  });

  it('creates and links a template from a legacy product snapshot', async () => {
    const repository = {
      findProductTemplateSource: jest.fn().mockResolvedValue({
        id: 'product-id',
        template_id: null,
      }),
      createFromProduct: jest.fn().mockResolvedValue(templateRecord),
    };
    const useCase = new CreateProductTemplateFromProductUseCase(
      repository as never,
      { enrichAssetUrl: jest.fn() } as never,
    );

    await useCase.execute('product-id');

    expect(repository.createFromProduct).toHaveBeenCalledWith('product-id');
  });
});
