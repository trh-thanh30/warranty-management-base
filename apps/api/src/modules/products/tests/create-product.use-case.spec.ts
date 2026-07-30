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
        warranty_code: 'WM-2026-CREATE',
        status: warranty_status.DRAFT,
      },
    });
    const tx = { product: { create: productCreate } };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn().mockResolvedValue('WM-2026-CREATE'),
    };
    const useCase = new CreateProductUseCase(
      {
        $transaction: jest.fn((callback) => callback(tx)),
      } as never,
      { findBySerialNumber: jest.fn().mockResolvedValue(null) } as never,
      { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') } as never,
      { findActiveById: jest.fn().mockResolvedValue(template) } as never,
      generateWarrantyCodeUseCase as never,
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
          warranty: {
            create: expect.objectContaining({
              warranty_code: 'WM-2026-CREATE',
              status: warranty_status.DRAFT,
            }),
          },
        }),
      }),
    );
    expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledWith(
      expect.any(Date),
      tx,
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
      { execute: jest.fn().mockResolvedValue('WM-2026-CREATE') } as never,
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

  it('keeps an explicit unique product code instead of generating one', async () => {
    const template = {
      id: 'template-id',
      category_id: 'category-id',
      default_warranty_duration_months: 24,
      default_warranty_terms: null,
    };
    const productCreate = jest.fn().mockResolvedValue({
      id: 'product-id',
      template_id: template.id,
      category_id: template.category_id,
      product_code: 'CUSTOM-001',
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
      category_ref: { id: 'category-id', name: 'Camera' },
    });
    const generateProductCodeUseCase = { execute: jest.fn() };
    const productsRepository = {
      findByProductCode: jest.fn().mockResolvedValue(null),
    };
    const useCase = new CreateProductUseCase(
      {
        $transaction: jest.fn((callback) =>
          callback({ product: { create: productCreate } }),
        ),
      } as never,
      productsRepository as never,
      generateProductCodeUseCase as never,
      { findActiveById: jest.fn().mockResolvedValue(template) } as never,
      { execute: jest.fn().mockResolvedValue('WM-2026-CREATE') } as never,
    );

    await useCase.execute({
      productCode: ' CUSTOM-001 ',
      templateId: template.id,
    });

    expect(productsRepository.findByProductCode).toHaveBeenCalledWith(
      'CUSTOM-001',
    );
    expect(generateProductCodeUseCase.execute).not.toHaveBeenCalled();
    expect(productCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ product_code: 'CUSTOM-001' }),
      }),
    );
  });

  it('keeps an explicit unique warranty code instead of generating one', async () => {
    const template = {
      id: 'template-id',
      category_id: 'category-id',
      default_warranty_duration_months: 24,
      default_warranty_terms: null,
    };
    const productCreate = jest.fn().mockResolvedValue({
      id: 'product-id',
      template_id: template.id,
      category_id: template.category_id,
      product_code: 'PRD-2026-ABCDEF',
      status: 'ACTIVE',
      metadata: null,
      assets: [],
      ownerships: [],
      warranty: {
        id: 'warranty-id',
        warranty_code: 'WM-2026-MANUAL1',
        status: warranty_status.DRAFT,
      },
      template: {
        ...template,
        name: 'Camera AI 4K',
        assets: [],
        category_ref: null,
      },
      category_ref: { id: 'category-id', name: 'Camera' },
    });
    const productsRepository = {
      findByWarrantyCode: jest.fn().mockResolvedValue(null),
    };
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new CreateProductUseCase(
      {
        $transaction: jest.fn((callback) =>
          callback({ product: { create: productCreate } }),
        ),
      } as never,
      productsRepository as never,
      { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') } as never,
      { findActiveById: jest.fn().mockResolvedValue(template) } as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute({
      templateId: template.id,
      warrantyCode: ' wm-2026-manual1 ',
    });

    expect(productsRepository.findByWarrantyCode).toHaveBeenCalledWith(
      'WM-2026-MANUAL1',
    );
    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(productCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          warranty: {
            create: expect.objectContaining({
              warranty_code: 'WM-2026-MANUAL1',
            }),
          },
        }),
      }),
    );
  });
});
