import { toProductResponse } from '@/modules/products/products.types';
import {
  activation_code_status,
  category_type,
  product_status,
  warranty_method,
  warranty_status,
} from '@prisma/client';

describe('toProductResponse', () => {
  it('exposes the activation code assigned to an admin product response', () => {
    const expiresAt = new Date('2099-01-25T00:00:00.000Z');
    const response = toProductResponse(
      {
        ...createProductFixture(),
        activation_code: {
          id: 'activation-code-id',
          code_ciphertext: 'encrypted-code',
          status: activation_code_status.AVAILABLE,
          expires_at: expiresAt,
          batch: { batch_code: 'ACB-20260725-001' },
          request: null,
          request_items: [],
          warranty: null,
        },
      },
      undefined,
      (ciphertext) =>
        ciphertext === 'encrypted-code' ? 'SP-ABC123' : 'unexpected',
    );

    expect(response.assignedActivationCode).toEqual({
      id: 'activation-code-id',
      code: 'SP-ABC123',
      status: 'AVAILABLE',
      expiresAt,
      batchCode: 'ACB-20260725-001',
      canReplace: true,
      unavailableReason: null,
    });
  });

  it('marks an assigned activation code with a request as unavailable', () => {
    const response = toProductResponse(
      {
        ...createProductFixture(),
        activation_code: {
          id: 'activation-code-id',
          code_ciphertext: 'encrypted-code',
          status: activation_code_status.AVAILABLE,
          expires_at: new Date('2099-01-25T00:00:00.000Z'),
          batch: { batch_code: 'ACB-20260725-001' },
          request: { id: 'request-id' },
          request_items: [],
          warranty: null,
        },
      },
      undefined,
      () => 'SP-ABC123',
    );

    expect(response.assignedActivationCode).toEqual(
      expect.objectContaining({
        status: 'PENDING_APPROVAL',
        canReplace: false,
        unavailableReason: 'PENDING_APPROVAL',
      }),
    );
  });

  it('normalizes an overdue available activation code as expired', () => {
    const response = toProductResponse(
      {
        ...createProductFixture(),
        activation_code: {
          id: 'activation-code-id',
          code_ciphertext: 'encrypted-code',
          status: activation_code_status.AVAILABLE,
          expires_at: new Date('2000-01-25T00:00:00.000Z'),
          batch: { batch_code: 'ACB-20260725-001' },
          request: null,
          request_items: [],
          warranty: null,
        },
      },
      undefined,
      () => 'SP-ABC123',
    );

    expect(response.assignedActivationCode).toEqual(
      expect.objectContaining({
        status: 'EXPIRED',
        canReplace: false,
        unavailableReason: 'EXPIRED',
      }),
    );
  });

  it('returns no assigned activation code when the product has none', () => {
    const response = toProductResponse(createProductFixture());

    expect(response.assignedActivationCode).toBeNull();
  });

  it('uses the product catalogue snapshot and hides template persistence details', () => {
    const response = toProductResponse({
      ...createProductFixture(),
      display_name: 'Product-owned name',
      product_code: 'PRODUCT-SKU',
      slug: 'product-owned-name',
      brand: 'Product brand',
      model: 'Product model',
      model_year: 2027,
      description: 'Product description',
      metadata: { specifications: [{ key: 'Power', value: '12W' }] },
    });

    expect(response).toEqual(
      expect.objectContaining({
        name: 'Product-owned name',
        sku: 'PRODUCT-SKU',
        slug: 'product-owned-name',
        brand: 'Product brand',
        model: 'Product model',
        modelYear: 2027,
        description: 'Product description',
        catalogueMetadata: {
          specifications: [{ key: 'Power', value: '12W' }],
        },
        metadata: { specifications: [{ key: 'Power', value: '12W' }] },
      }),
    );
    expect(response).not.toHaveProperty('templateId');
    expect(response).not.toHaveProperty('template');
  });

  it('projects product-owned catalogue fields while preserving physical metadata', () => {
    const response = toProductResponse({
      id: 'product-id',
      category_id: 'override-category-id',
      current_warranty_id: null,
      warranty_duration_months: null,
      warranty_method: null,
      warranty_terms: null,
      category_ref: {
        id: 'override-category-id',
        code: 'SPECIAL_CAMERA',
        slug: 'special-camera',
        name: 'Camera chuyên dụng',
        description: null,
        icon: null,
        image_url: null,
        type: category_type.PRODUCT,
        parent_id: null,
        order: 0,
        is_active: true,
        activation_form_enabled: false,
        activation_code_enabled: true,
        metadata: null,
        created_at: new Date('2026-07-25T00:00:00.000Z'),
        updated_at: new Date('2026-07-25T00:00:00.000Z'),
      },
      product_code: 'PRD-001',
      serial_number: 'SERIAL-001',
      display_name: 'PPF X10',
      slug: 'ppf-x10-unit-001',
      brand: 'Demo',
      model: 'X10',
      model_year: 2026,
      description: 'Product-owned description',
      metadata: {
        installationPosition: 'Windshield',
        specifications: [{ key: 'Thickness', value: '10 mil' }],
      },
      is_published: true,
      published_at: new Date('2026-07-25T00:00:00.000Z'),
      status: product_status.ACTIVE,
      created_at: new Date('2026-07-25T00:00:00.000Z'),
      updated_at: new Date('2026-07-25T00:00:00.000Z'),
      deleted_at: null,
      ownerships: [],
      assets: [],
      warranty: null,
    });

    expect(response).toEqual(
      expect.objectContaining({
        name: 'PPF X10',
        categoryId: 'override-category-id',
        categoryRef: expect.objectContaining({
          id: 'override-category-id',
          name: 'Camera chuyên dụng',
        }),
        brand: 'Demo',
        model: 'X10',
        description: 'Product-owned description',
        catalogueMetadata: {
          installationPosition: 'Windshield',
          specifications: [{ key: 'Thickness', value: '10 mil' }],
        },
        isPublished: true,
        publishedAt: new Date('2026-07-25T00:00:00.000Z'),
        metadata: {
          specifications: [{ key: 'Thickness', value: '10 mil' }],
          installationPosition: 'Windshield',
        },
      }),
    );
  });

  it.each([
    {
      expectedCanEdit: true,
      expectedReason: null,
      openRequests: [],
      status: warranty_status.DRAFT,
    },
    {
      expectedCanEdit: false,
      expectedReason: 'WARRANTY_NOT_DRAFT',
      openRequests: [],
      status: warranty_status.ACTIVE,
    },
    {
      expectedCanEdit: false,
      expectedReason: 'OPEN_ACTIVATION_REQUEST',
      openRequests: [{ id: 'request-id' }],
      status: warranty_status.DRAFT,
    },
  ])(
    'maps warranty-code edit capability for $status with $openRequests.length open requests',
    ({ expectedCanEdit, expectedReason, openRequests, status }) => {
      const response = toProductResponse({
        ...createProductFixture(),
        warranty: {
          id: 'warranty-id',
          product_id: 'product-id',
          dealer_id: null,
          activation_code_id: null,
          warranty_code: 'WM-2026-ABCDEF',
          method: warranty_method.REPAIR,
          start_date: null,
          end_date: null,
          duration_months: 24,
          coverage_limit_amount: null,
          max_claim_count: null,
          max_amount_per_claim: null,
          status,
          terms: null,
          metadata: null,
          activated_by_id: null,
          voided_at: null,
          voided_by_id: null,
          void_reason: null,
          created_at: new Date('2026-07-25T00:00:00.000Z'),
          updated_at: new Date('2026-07-25T00:00:00.000Z'),
        },
        warranty_activation_requests: openRequests,
      });

      expect(response).toEqual(
        expect.objectContaining({
          canEditWarrantyCode: expectedCanEdit,
          warrantyCodeEditLockedReason: expectedReason,
        }),
      );
    },
  );
});

function createProductFixture() {
  return {
    id: 'product-id',
    category_id: 'category-id',
    current_warranty_id: null,
    warranty_duration_months: null,
    warranty_method: null,
    warranty_terms: null,
    product_code: 'PRD-001',
    serial_number: 'SERIAL-001',
    display_name: 'PPF X10',
    slug: 'ppf-x10-unit-001',
    brand: 'Demo',
    model: 'X10',
    model_year: 2026,
    description: null,
    metadata: null,
    is_published: true,
    published_at: new Date('2026-07-25T00:00:00.000Z'),
    status: product_status.ACTIVE,
    created_at: new Date('2026-07-25T00:00:00.000Z'),
    updated_at: new Date('2026-07-25T00:00:00.000Z'),
    deleted_at: null,
    ownerships: [],
    assets: [],
    category_ref: {
      id: 'category-id',
      code: 'ACCESSORY',
      slug: 'accessory',
      name: 'Accessory',
      description: null,
      icon: null,
      image_url: null,
      type: category_type.PRODUCT,
      parent_id: null,
      order: 0,
      is_active: true,
      activation_form_enabled: false,
      activation_code_enabled: true,
      metadata: null,
      created_at: new Date('2026-07-25T00:00:00.000Z'),
      updated_at: new Date('2026-07-25T00:00:00.000Z'),
    },
  };
}
