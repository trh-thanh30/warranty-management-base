import { ListProductTemplatesUseCase } from '@/modules/product-templates/use-cases/list-product-templates.use-case';

describe('ListProductTemplatesUseCase', () => {
  it('maps reusable template assets without changing pagination metadata', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'template-id',
            sku: 'DECAL-3M-CR70',
            slug: 'decal-3m-crystalline',
            name: 'Decal 3M Crystalline',
            category_id: 'category-id',
            category_ref: null,
            brand: '3M',
            model: 'CR70',
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
          },
        ],
        meta: { page: 1, limit: 20, total: 1 },
      }),
    };
    const assetsService = { enrichAssetUrl: jest.fn() };
    const useCase = new ListProductTemplatesUseCase(
      repository as never,
      assetsService as never,
    );

    const result = await useCase.execute({
      isActive: 'true',
      isPublished: 'true',
    });

    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: 'template-id',
        name: 'Decal 3M Crystalline',
        defaultWarrantyDurationMonths: 36,
      }),
    );
    expect(result.meta.total).toBe(1);
    expect(repository.list).toHaveBeenCalledWith({
      isActive: 'true',
      isPublished: 'true',
    });
  });
});
