import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { warranty_status } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

const now = new Date('2026-08-29T00:00:00.000Z');

function persistedProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-id',
    category_id: 'category-id',
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
    created_at: now,
    updated_at: now,
    deleted_at: null,
    assets: [],
    ownerships: [],
    category_ref: null,
    template: null,
    warranty_activation_requests: [],
    warranty: {
      id: 'warranty-id',
      warranty_code: 'WM-2026-CREATE',
      status: warranty_status.DRAFT,
      duration_months: 24,
      start_date: null,
      end_date: null,
      coverage_limit_amount: null,
      max_claim_count: null,
      max_amount_per_claim: null,
      terms: null,
    },
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
    findByWarrantyCode: jest.fn().mockResolvedValue(null),
  };
  const generateProductCode = {
    execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF'),
  };
  const generateWarrantyCode = {
    execute: jest.fn().mockResolvedValue('WM-2026-CREATE'),
  };
  const useCase = new CreateProductUseCase(
    productsRepository as never,
    generateProductCode as never,
    generateWarrantyCode as never,
  );
  return {
    generateProductCode,
    generateWarrantyCode,
    productsRepository,
    useCase,
  };
}

describe('CreateProductUseCase', () => {
  it('creates an authoritative product without a product template', async () => {
    const { productsRepository, useCase } = setup();

    const result = await useCase.execute({
      name: ' Camera AI 4K ',
      categoryId: 'category-id',
      brand: ' Acme ',
      model: ' C4K ',
      modelYear: 2026,
      displayName: ' Camera cổng chính ',
      serialNumber: 'SN-001',
      warrantyDurationMonths: 24,
    });

    expect(productsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: 'Camera AI 4K',
        brand: 'Acme',
        model: 'C4K',
        category_ref: { connect: { id: 'category-id' } },
        warranty_duration_months: 24,
        warranty_method: 'REPAIR',
        warranties: {
          create: expect.objectContaining({
            duration_months: 24,
            warranty_code: 'WM-2026-CREATE',
            status: warranty_status.DRAFT,
          }),
        },
      }),
    );
    expect(result.name).toBe('Camera AI 4K');
    expect(result).not.toHaveProperty('templateId');
    expect(result).not.toHaveProperty('template');
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

  it('keeps an explicit unique product code instead of generating one', async () => {
    const { generateProductCode, productsRepository, useCase } = setup();

    await useCase.execute({
      name: 'Camera AI 4K',
      categoryId: 'category-id',
      productCode: ' CUSTOM-001 ',
      warrantyDurationMonths: 24,
    });

    expect(productsRepository.findByProductCode).toHaveBeenCalledWith(
      'CUSTOM-001',
    );
    expect(generateProductCode.execute).not.toHaveBeenCalled();
    expect(productsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ product_code: 'CUSTOM-001' }),
    );
  });

  it('keeps an explicit unique warranty code instead of generating one', async () => {
    const { generateWarrantyCode, productsRepository, useCase } = setup();

    await useCase.execute({
      name: 'Camera AI 4K',
      categoryId: 'category-id',
      warrantyCode: ' wm-2026-manual1 ',
      warrantyDurationMonths: 24,
    });

    expect(productsRepository.findByWarrantyCode).toHaveBeenCalledWith(
      'WM-2026-MANUAL1',
    );
    expect(generateWarrantyCode.execute).not.toHaveBeenCalled();
    expect(productsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        warranties: {
          create: expect.objectContaining({
            warranty_code: 'WM-2026-MANUAL1',
          }),
        },
      }),
    );
  });
});
