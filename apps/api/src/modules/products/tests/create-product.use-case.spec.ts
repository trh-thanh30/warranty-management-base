import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

const now = new Date('2026-09-04T00:00:00.000Z');

function persistedProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-id',
    category_id: 'category-id',
    current_warranty_id: null,
    product_code: 'PRD-2026-ABCDEF',
    serial_number: 'SN-001',
    display_name: 'Camera AI 4K',
    slug: 'camera-ai-4k-prd-2026-abcdef',
    brand: 'Acme',
    model: 'C4K',
    model_year: 2026,
    description: null,
    metadata: null,
    is_published: false,
    published_at: null,
    status: 'ACTIVE',
    warranty_duration_months: 24,
    warranty_method: 'REPAIR',
    warranty_terms: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    assets: [],
    ownerships: [],
    category_ref: null,
    warranty_activation_requests: [],
    warranty: null,
    ...overrides,
  };
}

function setup() {
  const productsRepository = {
    create: jest.fn().mockResolvedValue(persistedProduct()),
    findActiveProductCategoryById: jest
      .fn()
      .mockResolvedValue({ id: 'category-id' }),
    findByProductCode: jest.fn().mockResolvedValue(null),
    findBySerialNumber: jest.fn().mockResolvedValue(null),
  };
  const generateProductCode = {
    execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF'),
  };
  const useCase = new CreateProductUseCase(
    productsRepository as never,
    generateProductCode as never,
  );

  return { generateProductCode, productsRepository, useCase };
}

describe('CreateProductUseCase', () => {
  it('stores the product warranty policy without pre-issuing a Warranty', async () => {
    const { productsRepository, useCase } = setup();

    const result = await useCase.execute({
      name: ' Camera AI 4K ',
      categoryId: 'category-id',
      brand: ' Acme ',
      model: ' C4K ',
      modelYear: 2026,
      warrantyDurationMonths: 24,
      warrantyTerms: ' Standard policy ',
    });

    expect(productsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: 'Camera AI 4K',
        brand: 'Acme',
        model: 'C4K',
        category_ref: { connect: { id: 'category-id' } },
        warranty_duration_months: 24,
        warranty_method: 'REPAIR',
        warranty_terms: 'Standard policy',
      }),
    );
    const createInput = productsRepository.create.mock.calls[0]?.[0];
    expect(createInput).not.toHaveProperty('warranty');
    expect(createInput).not.toHaveProperty('warranties');
    expect(result.warranty).toBeNull();
    expect(result.warrantyDurationMonths).toBe(24);
  });

  it('requires an active product category', async () => {
    const { productsRepository, useCase } = setup();
    productsRepository.findActiveProductCategoryById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        name: 'Camera AI 4K',
        categoryId: 'missing-category',
        warrantyDurationMonths: 24,
      }),
    ).rejects.toThrow('Product category not found');
  });

  it('keeps an explicit unique product code', async () => {
    const { generateProductCode, productsRepository, useCase } = setup();

    await useCase.execute({
      name: 'Camera AI 4K',
      categoryId: 'category-id',
      productCode: 'PRD-MANUAL',
      warrantyDurationMonths: 24,
    });

    expect(generateProductCode.execute).not.toHaveBeenCalled();
    expect(productsRepository.findByProductCode).toHaveBeenCalledWith(
      'PRD-MANUAL',
    );
    expect(productsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ product_code: 'PRD-MANUAL' }),
    );
  });

  it('requires a positive warranty policy duration', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({
        name: 'Camera AI 4K',
        categoryId: 'category-id',
        warrantyDurationMonths: 0,
      }),
    ).rejects.toMatchObject({
      details: { code: 'WARRANTY_DURATION_REQUIRED' },
    });
  });
});
