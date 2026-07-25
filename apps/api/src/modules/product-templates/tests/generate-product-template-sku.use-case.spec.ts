import { GenerateProductTemplateSkuUseCase } from '@/modules/product-templates/use-cases/generate-product-template-sku.use-case';

describe('GenerateProductTemplateSkuUseCase', () => {
  it('generates a normalized SKU from the template name', async () => {
    const repository = {
      findBySku: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GenerateProductTemplateSkuUseCase(repository as never);

    const sku = await useCase.execute('Điện thoại iPhone 15 Pro');

    expect(sku).toBe('DIEN-THOAI-IPHONE-15-PRO');
    expect(repository.findBySku).toHaveBeenCalledWith(sku);
  });

  it('adds a sequence when the generated SKU already exists', async () => {
    const repository = {
      findBySku: jest
        .fn()
        .mockResolvedValueOnce({ id: 'existing-template' })
        .mockResolvedValueOnce(null),
    };
    const useCase = new GenerateProductTemplateSkuUseCase(repository as never);

    const sku = await useCase.execute('Camera AI 4K');

    expect(sku).toBe('CAMERA-AI-4K-2');
  });
});
