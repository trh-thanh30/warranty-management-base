import { toProductResponse } from '@/modules/products/products.types';
import { category_type, product_status } from '@prisma/client';

describe('toProductResponse', () => {
  it('projects template-owned catalogue fields while preserving physical metadata', () => {
    const response = toProductResponse({
      id: 'product-id',
      template_id: 'template-id',
      product_code: 'PRD-001',
      serial_number: 'SERIAL-001',
      display_name: null,
      status: product_status.ACTIVE,
      metadata: { installationPosition: 'Windshield' },
      created_at: new Date('2026-07-25T00:00:00.000Z'),
      updated_at: new Date('2026-07-25T00:00:00.000Z'),
      deleted_at: null,
      ownerships: [],
      assets: [],
      warranty: null,
      template: {
        id: 'template-id',
        sku: 'PPF-X10',
        slug: 'ppf-x10',
        name: 'PPF X10',
        category_id: 'category-id',
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
          metadata: null,
          created_at: new Date('2026-07-25T00:00:00.000Z'),
          updated_at: new Date('2026-07-25T00:00:00.000Z'),
        },
        brand: 'Demo',
        model: 'X10',
        model_year: 2026,
        description: 'Shared description',
        default_warranty_duration_months: 36,
        default_warranty_terms: null,
        metadata: {
          specifications: [{ key: 'Thickness', value: '10 mil' }],
        },
        is_active: true,
        is_published: true,
        published_at: new Date('2026-07-25T00:00:00.000Z'),
        created_at: new Date('2026-07-25T00:00:00.000Z'),
        updated_at: new Date('2026-07-25T00:00:00.000Z'),
        assets: [],
      },
    });

    expect(response).toEqual(
      expect.objectContaining({
        name: 'PPF X10',
        categoryId: 'category-id',
        brand: 'Demo',
        model: 'X10',
        description: 'Shared description',
        isPublished: true,
        publishedAt: new Date('2026-07-25T00:00:00.000Z'),
        metadata: {
          specifications: [{ key: 'Thickness', value: '10 mil' }],
          installationPosition: 'Windshield',
        },
      }),
    );
  });
});
