import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

const now = new Date('2026-09-04T00:00:00.000Z');

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-id',
    category_id: 'category-id',
    current_warranty_id: null,
    product_code: 'PRD-001',
    serial_number: 'SN-001',
    display_name: 'Camera AI 4K',
    slug: 'camera-ai-4k-prd-001',
    brand: null,
    model: null,
    model_year: null,
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

function setup(existing = product()) {
  const repository = {
    findById: jest.fn().mockResolvedValue(existing),
    findByProductCode: jest.fn().mockResolvedValue(null),
    findBySerialNumber: jest.fn().mockResolvedValue(null),
    findActiveProductCategoryById: jest
      .fn()
      .mockResolvedValue({ id: 'new-category-id' }),
    update: jest.fn().mockImplementation(async (_id, data) =>
      product({
        ...existing,
        category_id: data.category_ref
          ? data.category_ref.connect.id
          : existing.category_id,
        display_name: data.display_name ?? existing.display_name,
        warranty_duration_months:
          data.warranty_duration_months ?? existing.warranty_duration_months,
        warranty_terms: data.warranty_terms ?? existing.warranty_terms,
      }),
    ),
  };
  const useCase = new UpdateProductUseCase(repository as never);

  return { repository, useCase };
}

describe('UpdateProductUseCase', () => {
  it('updates product fields and warranty policy without issuing a Warranty', async () => {
    const { repository, useCase } = setup();

    await useCase.execute('product-id', {
      name: 'Updated camera',
      categoryId: 'new-category-id',
      warrantyDurationMonths: 36,
      warrantyTerms: 'Updated policy',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({
        category_ref: { connect: { id: 'new-category-id' } },
        display_name: 'Updated camera',
        warranty_duration_months: 36,
        warranty_terms: 'Updated policy',
      }),
    );
    const updateInput = repository.update.mock.calls[0]?.[1];
    expect(updateInput).not.toHaveProperty('warranty');
    expect(updateInput).not.toHaveProperty('warranties');
  });

  it('changes future product policy without mutating an issued legacy Warranty', async () => {
    const issuedWarranty = {
      id: 'warranty-id',
      warranty_code: 'WM-LEGACY',
      status: 'ACTIVE',
      duration_months: 24,
      start_date: now,
      end_date: now,
      coverage_limit_amount: null,
      max_claim_count: null,
      max_amount_per_claim: null,
      terms: null,
    };
    const { repository, useCase } = setup(
      product({ warranty: issuedWarranty, current_warranty_id: 'warranty-id' }),
    );

    await useCase.execute('product-id', { warrantyDurationMonths: 60 });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ warranty_duration_months: 60 }),
    );
    expect(repository.update.mock.calls[0]?.[1]).not.toHaveProperty('warranty');
  });

  it('does not create a Warranty when updating a product without one', async () => {
    const { repository, useCase } = setup();

    const result = await useCase.execute('product-id', {
      displayName: 'Camera updated',
    });

    expect(repository.update.mock.calls[0]?.[1]).not.toHaveProperty('warranty');
    expect(result.warranty).toBeNull();
  });

  it('rejects a missing product', async () => {
    const { repository, useCase } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-product', { displayName: 'Updated' }),
    ).rejects.toThrow('Product not found');
  });

  it('rejects a duplicate product code', async () => {
    const { repository, useCase } = setup();
    repository.findByProductCode.mockResolvedValue({ id: 'other-product' });

    await expect(
      useCase.execute('product-id', { productCode: 'PRD-OTHER' }),
    ).rejects.toThrow('Product code already exists');
  });
});
