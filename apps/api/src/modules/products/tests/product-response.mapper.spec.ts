import { toProductResponse } from '@/modules/products/products.types';
import {
  category_type,
  product_status,
  warranty_method,
  warranty_status,
} from '@prisma/client';

describe('toProductResponse', () => {
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
      metadata: null,
      created_at: new Date('2026-07-25T00:00:00.000Z'),
      updated_at: new Date('2026-07-25T00:00:00.000Z'),
    },
  };
}
