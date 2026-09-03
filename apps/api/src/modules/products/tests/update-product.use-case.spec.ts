import { AssetsService } from '@/modules/assets/assets.service';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
import { Test } from '@nestjs/testing';
import { warranty_status } from '@prisma/client';

describe('UpdateProductUseCase', () => {
  it('can be resolved by the Nest dependency injection container', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        { provide: ProductsRepository, useValue: {} },
        { provide: GenerateWarrantyCodeUseCase, useValue: {} },
        { provide: AssetsService, useValue: {} },
      ],
    }).compile();

    expect(moduleRef.get(UpdateProductUseCase)).toBeInstanceOf(
      UpdateProductUseCase,
    );
  });

  it('updates only physical product fields including display name', async () => {
    const existing = {
      id: 'product-id',
      serial_number: 'SN-001',
      display_name: 'Camera AI 4K',
      product_code: 'CAM-4K',
      slug: 'camera-ai-4k',
      brand: null,
      model: null,
      model_year: null,
      description: null,
      metadata: null,
      is_published: false,
      published_at: null,
      deleted_at: null,
      warranty: {
        id: 'warranty-id',
        warranty_code: 'WM-2026-EXISTING',
        status: warranty_status.DRAFT,
      },
      warranty_activation_requests: [],
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      findBySerialNumber: jest.fn(),
      update: jest.fn().mockResolvedValue({
        ...existing,
        display_name: 'Camera kho hàng',
        product_code: 'PRD-001',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
        assets: [],
        ownerships: [],
        warranty: null,
      }),
    };
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    const result = await useCase.execute('product-id', {
      displayName: ' Camera kho hàng ',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ display_name: 'Camera kho hàng' }),
    );
    expect(result.displayName).toBe('Camera kho hàng');
  });

  it('updates the product category after validating the override', async () => {
    const existing = {
      id: 'product-id',
      category_id: 'template-category-id',
      serial_number: null,
      display_name: 'Camera AI 4K',
      product_code: 'CAM-4K',
      slug: 'camera-ai-4k',
      brand: null,
      model: null,
      model_year: null,
      description: null,
      metadata: null,
      is_published: false,
      published_at: null,
      deleted_at: null,
      warranty: {
        id: 'warranty-id',
        warranty_code: 'WM-2026-EXISTING',
        status: warranty_status.DRAFT,
      },
      warranty_activation_requests: [],
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      findActiveProductCategoryById: jest.fn().mockResolvedValue({
        id: 'override-category-id',
      }),
      update: jest.fn().mockResolvedValue({
        ...existing,
        category_id: 'override-category-id',
        category_ref: {
          id: 'override-category-id',
          name: 'Camera chuyên dụng',
        },
        product_code: 'PRD-001',
        status: 'ACTIVE',
        assets: [],
        ownerships: [],
        warranty: null,
      }),
    };
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', {
      categoryId: 'override-category-id',
    });

    expect(repository.findActiveProductCategoryById).toHaveBeenCalledWith(
      'override-category-id',
    );
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        category_ref: { connect: { id: 'override-category-id' } },
      }),
    );
  });

  it('normalizes and updates a unique product code', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', {
      productCode: ' PRD-UPDATED-001 ',
    });

    expect(repository.findByProductCode).toHaveBeenCalledWith(
      'PRD-UPDATED-001',
    );
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ product_code: 'PRD-UPDATED-001' }),
    );
  });

  it('rejects a product code already assigned to another product', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    repository.findByProductCode.mockResolvedValue({ id: 'other-product-id' });
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('product-id', { productCode: 'PRD-DUPLICATE' }),
    ).rejects.toThrow('Product code already exists');

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('updates authoritative catalogue fields and category', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', {
      name: 'New product name',
      categoryId: 'new-category-id',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        category_ref: { connect: { id: 'new-category-id' } },
        display_name: 'New product name',
        warranty: undefined,
      }),
    );
  });

  it('replaces product-owned cover and gallery assets', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', {
      coverAssetId: '1f218ef4-6878-4c1d-a6e6-11d31ed85aa1',
      galleryAssetIds: [
        'b7de03bf-d9bb-4018-aab5-98e108ce66c3',
        'b7de03bf-d9bb-4018-aab5-98e108ce66c3',
      ],
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        assets: {
          deleteMany: {
            role: { in: ['COVER', 'GALLERY'] },
          },
          create: [
            expect.objectContaining({ role: 'COVER' }),
            expect.objectContaining({ role: 'GALLERY', sort_order: 0 }),
          ],
        },
      }),
    );
  });

  it('updates the individual warranty duration while the warranty is draft', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', { warrantyDurationMonths: 60 });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        warranty: { update: { duration_months: 60 } },
      }),
    );
  });

  it.each([
    warranty_status.ACTIVE,
    warranty_status.EXPIRED,
    warranty_status.VOIDED,
  ])('rejects a duration change for a %s warranty', async (status) => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      status,
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('product-id', { warrantyDurationMonths: 60 }),
    ).rejects.toMatchObject({
      details: { code: 'WARRANTY_DURATION_NOT_DRAFT' },
    });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('allows other product edits when a non-draft duration is submitted unchanged', async () => {
    const existing = createExistingProduct({
      duration_months: 24,
      id: 'warranty-id',
      status: warranty_status.ACTIVE,
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', {
      displayName: 'Updated display name',
      warrantyDurationMonths: 24,
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        display_name: 'Updated display name',
        warranty_duration_months: 24,
        warranty: undefined,
      }),
    );
  });

  it('uses submitted product warranty policy when creating a missing warranty', async () => {
    const existing = createExistingProduct(null);
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn().mockResolvedValue('WM-2026-NEW') } as never,
    );

    await useCase.execute('product-id', {
      warrantyDurationMonths: 180,
      warrantyTerms: 'New product terms',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        warranty_duration_months: 180,
        warranty_terms: 'New product terms',
        warranty: {
          create: expect.objectContaining({
            duration_months: 180,
            terms: 'New product terms',
          }),
        },
      }),
    );
  });

  it('requires a submitted duration when a product has no warranty', async () => {
    const existing = createExistingProduct(null);
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn().mockResolvedValue('WM-2026-NEW') } as never,
    );

    await expect(
      useCase.execute('product-id', { displayName: 'Legacy product' }),
    ).rejects.toMatchObject({
      details: { code: 'WARRANTY_DURATION_REQUIRED' },
    });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects an inactive or missing replacement category', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    repository.findActiveProductCategoryById.mockResolvedValue(null);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('product-id', { categoryId: 'inactive-category-id' }),
    ).rejects.toThrow('Product category not found');

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('generates a code when the existing warranty code is missing', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: null,
    });
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(
        createUpdatedProduct(existing, {
          id: 'warranty-id',
          warranty_code: 'WM-2026-UPDATE',
          status: warranty_status.DRAFT,
        }),
      ),
    };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn().mockResolvedValue('WM-2026-UPDATE'),
    };
    const useCase = new UpdateProductUseCase(
      repository as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute('product-id', { displayName: 'Camera updated' });

    expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        warranty: {
          update: { warranty_code: 'WM-2026-UPDATE' },
        },
      }),
    );
  });

  it('preserves an existing warranty code without generating a new one', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest
        .fn()
        .mockResolvedValue(createUpdatedProduct(existing, existing.warranty)),
    };
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new UpdateProductUseCase(
      repository as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute('product-id', { displayName: 'Camera updated' });

    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ warranty: undefined }),
    );
  });

  it('creates a coded draft warranty when the product has no warranty', async () => {
    const existing = createExistingProduct(null);
    const createdWarranty = {
      id: 'warranty-id',
      warranty_code: 'WM-2026-UPDATE',
      status: warranty_status.DRAFT,
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest
        .fn()
        .mockResolvedValue(createUpdatedProduct(existing, createdWarranty)),
    };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn().mockResolvedValue('WM-2026-UPDATE'),
    };
    const useCase = new UpdateProductUseCase(
      repository as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute('product-id', {
      displayName: 'Camera updated',
      warrantyDurationMonths: 24,
      warrantyTerms: 'Product terms',
    });

    expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        warranty: {
          create: {
            warranty_code: 'WM-2026-UPDATE',
            duration_months: 24,
            terms: 'Product terms',
            product: { connect: { id: 'product-id' } },
            start_date: null,
            end_date: null,
            status: warranty_status.DRAFT,
          },
        },
      }),
    );
  });

  it('preserves the existing warranty code when the submitted value is blank', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new UpdateProductUseCase(
      repository as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute('product-id', { warrantyCode: '   ' });

    expect(repository.findByWarrantyCode).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ warranty: undefined }),
    );
  });

  it('treats the normalized current warranty code as a no-op', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new UpdateProductUseCase(
      repository as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute('product-id', {
      warrantyCode: ' wm-2026-existing ',
    });

    expect(repository.findByWarrantyCode).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ warranty: undefined }),
    );
  });

  it('normalizes and stores a valid unique replacement warranty code', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new UpdateProductUseCase(
      repository as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute('product-id', {
      warrantyCode: ' wm-2026-replace1 ',
    });

    expect(repository.findByWarrantyCode).toHaveBeenCalledWith(
      'WM-2026-REPLACE1',
    );
    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        warranty: {
          update: { warranty_code: 'WM-2026-REPLACE1' },
        },
      }),
    );
  });

  it('rejects a duplicate replacement warranty code', async () => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    repository.findByWarrantyCode.mockResolvedValue({ id: 'other-product' });
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('product-id', {
        warrantyCode: 'WM-2026-DUPLICATE',
      }),
    ).rejects.toThrow('Warranty code already exists');

    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each([
    warranty_status.ACTIVE,
    warranty_status.EXPIRED,
    warranty_status.VOIDED,
  ])('rejects a replacement for a %s warranty', async (status) => {
    const existing = createExistingProduct({
      id: 'warranty-id',
      status,
      warranty_code: 'WM-2026-EXISTING',
    });
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('product-id', {
        warrantyCode: 'WM-2026-REPLACE1',
      }),
    ).rejects.toThrow(
      'Warranty code can only be changed while warranty is draft',
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects a replacement while an activation request is open', async () => {
    const existing = createExistingProduct(
      {
        id: 'warranty-id',
        warranty_code: 'WM-2026-EXISTING',
      },
      [{ id: 'request-id' }],
    );
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('product-id', {
        warrantyCode: 'WM-2026-REPLACE1',
      }),
    ).rejects.toThrow(
      'Warranty code cannot be changed while an activation request is open',
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('creates a draft warranty with a submitted code for a legacy product', async () => {
    const existing = createExistingProduct(null);
    const repository = createRepository(existing);
    const useCase = new UpdateProductUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await useCase.execute('product-id', {
      warrantyCode: ' wm-2026-manual1 ',
      warrantyDurationMonths: 24,
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        warranty: {
          create: expect.objectContaining({
            status: warranty_status.DRAFT,
            warranty_code: 'WM-2026-MANUAL1',
          }),
        },
      }),
    );
  });
});

function createExistingProduct(
  warranty: {
    duration_months?: number;
    id: string;
    status?: warranty_status;
    warranty_code: string | null;
  } | null,
  openRequests: Array<{ id: string }> = [],
) {
  return {
    id: 'product-id',
    category_id: 'category-id',
    product_code: 'PRD-001',
    serial_number: 'SN-001',
    display_name: 'Camera AI 4K',
    slug: 'camera-ai-4k',
    brand: null,
    model: null,
    model_year: null,
    description: null,
    metadata: null,
    is_published: false,
    published_at: null,
    deleted_at: null,
    warranty: warranty
      ? {
          ...warranty,
          duration_months: warranty.duration_months ?? 24,
          status: warranty.status ?? warranty_status.DRAFT,
        }
      : null,
    warranty_activation_requests: openRequests,
  };
}

function createRepository(existing: ReturnType<typeof createExistingProduct>) {
  return {
    findActiveProductCategoryById: jest
      .fn()
      .mockResolvedValue({ id: 'new-category-id' }),
    findById: jest.fn().mockResolvedValue(existing),
    findByProductCode: jest.fn().mockResolvedValue(null),
    findByWarrantyCode: jest.fn().mockResolvedValue(null),
    update: jest
      .fn()
      .mockResolvedValue(createUpdatedProduct(existing, existing.warranty)),
  };
}

function createUpdatedProduct(
  existing: ReturnType<typeof createExistingProduct>,
  warranty: {
    duration_months?: number;
    id: string;
    warranty_code: string | null;
    status?: warranty_status;
  } | null,
) {
  return {
    ...existing,
    product_code: 'PRD-001',
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date(),
    assets: [],
    ownerships: [],
    category_ref: null,
    warranty,
  };
}
