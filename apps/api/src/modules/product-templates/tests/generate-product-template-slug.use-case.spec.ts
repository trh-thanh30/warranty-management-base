import { GenerateProductTemplateSlugUseCase } from '@/modules/product-templates/use-cases/generate-product-template-slug.use-case';

describe('GenerateProductTemplateSlugUseCase', () => {
  it('generates a unique URL slug from the template name', async () => {
    const repository = {
      findBySlug: jest
        .fn()
        .mockResolvedValueOnce({ id: 'existing-template' })
        .mockResolvedValueOnce(null),
    };
    const useCase = new GenerateProductTemplateSlugUseCase(repository as never);

    const slug = await useCase.execute('Điện thoại iPhone 15 Pro');

    expect(slug).toBe('dien-thoai-iphone-15-pro-2');
  });
});
