import { CreateProductTemplateUseCase } from '@/modules/product-templates/use-cases/create-product-template.use-case';
import { UpdateProductTemplateUseCase } from '@/modules/product-templates/use-cases/update-product-template.use-case';
import { category_type } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

const templateRecord = {
  id: 'template-id',
  sku: 'PPF-X10',
  slug: 'ppf-x10',
  name: 'PPF X10',
  category_id: 'category-id',
  category_ref: null,
  brand: '3M',
  model: 'X10',
  model_year: null,
  description: null,
  default_warranty_duration_months: 36,
  default_warranty_terms: null,
  metadata: null,
  is_active: true,
  is_published: false,
  published_at: null,
  created_at: new Date('2026-07-25T00:00:00.000Z'),
  updated_at: new Date('2026-07-25T00:00:00.000Z'),
  assets: [],
  _count: { products: 0 },
};

describe('ProductTemplate write use cases', () => {
  it('creates a reusable template with validated image assets', async () => {
    const repository = {
      findBySku: jest.fn().mockResolvedValue(null),
      findBySlug: jest.fn().mockResolvedValue(null),
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
      sku: ' ppf-x10 ',
      slug: 'ppf-x10',
      name: 'PPF X10',
      categoryId: 'category-id',
      coverAssetId: 'cover-id',
      galleryAssetIds: ['gallery-id'],
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sku: 'PPF-X10',
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
});
