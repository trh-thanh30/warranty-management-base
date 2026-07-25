import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { warranty_status } from '@prisma/client';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('CreateProductUseCase', () => {
  it('creates a physical product from a required template with a display name', async () => {
    const template = {
      id: 'template-id',
      sku: 'CAM-4K',
      slug: 'camera-ai-4k',
      name: 'Camera AI 4K',
      category_id: 'category-id',
      brand: 'Acme',
      model: 'C4K',
      model_year: 2026,
      description: null,
      default_warranty_duration_months: 24,
      default_warranty_terms: null,
      metadata: null,
      is_active: true,
      is_published: false,
      published_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const productCreate = jest.fn().mockResolvedValue({
      id: 'product-id',
      template_id: template.id,
      template: { ...template, assets: [], category_ref: null },
      category_id: template.category_id,
      category_ref: null,
      product_code: 'PRD-2026-ABCDEF',
      serial_number: 'SN-001',
      display_name: 'Camera cổng chính',
      status: 'ACTIVE',
      metadata: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      assets: [],
      ownerships: [],
      warranty: {
        id: 'warranty-id',
        warranty_code: null,
        status: warranty_status.DRAFT,
      },
    });
    const useCase = new CreateProductUseCase(
      {
        $transaction: jest.fn((callback) =>
          callback({ product: { create: productCreate } }),
        ),
      } as never,
      { findBySerialNumber: jest.fn().mockResolvedValue(null) } as never,
      { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') } as never,
      { findActiveById: jest.fn().mockResolvedValue(template) } as never,
    );

    const result = await useCase.execute({
      templateId: template.id,
      displayName: ' Camera cổng chính ',
      serialNumber: 'SN-001',
    });

    expect(productCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category_ref: { connect: { id: template.category_id } },
          display_name: 'Camera cổng chính',
          template: { connect: { id: template.id } },
        }),
      }),
    );
    expect(result.displayName).toBe('Camera cổng chính');
    expect(result.name).toBe(template.name);
  });

  it('allows an active product category to override the template category', async () => {
    const template = {
      id: 'template-id',
      category_id: 'template-category-id',
      default_warranty_duration_months: 24,
      default_warranty_terms: null,
    };
    const productCreate = jest.fn().mockResolvedValue({
      id: 'product-id',
      template_id: template.id,
      category_id: 'override-category-id',
      product_code: 'PRD-2026-ABCDEF',
      status: 'ACTIVE',
      metadata: null,
      assets: [],
      ownerships: [],
      warranty: null,
      template: {
        ...template,
        name: 'Camera AI 4K',
        assets: [],
        category_ref: null,
      },
      category_ref: {
        id: 'override-category-id',
        name: 'Camera chuyên dụng',
      },
    });
    const productsRepository = {
      findBySerialNumber: jest.fn(),
      findActiveProductCategoryById: jest.fn().mockResolvedValue({
        id: 'override-category-id',
      }),
    };
    const useCase = new CreateProductUseCase(
      {
        $transaction: jest.fn((callback) =>
          callback({ product: { create: productCreate } }),
        ),
      } as never,
      productsRepository as never,
      { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') } as never,
      { findActiveById: jest.fn().mockResolvedValue(template) } as never,
    );

    await useCase.execute({
      templateId: template.id,
      categoryId: 'override-category-id',
    });

    expect(
      productsRepository.findActiveProductCategoryById,
    ).toHaveBeenCalledWith('override-category-id');
    expect(productCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category_ref: { connect: { id: 'override-category-id' } },
        }),
      }),
    );
  });
});
