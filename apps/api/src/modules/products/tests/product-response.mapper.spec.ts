import { toProductResponse } from '@/modules/products/products.types';
import { product_category, product_status } from '@prisma/client';

describe('toProductResponse', () => {
  it('projects template-owned catalogue fields while preserving physical metadata', () => {
    const response = toProductResponse({
      id: 'product-id',
      template_id: 'template-id',
      product_code: 'PRD-001',
      warranty_code: null,
      serial_number: 'SERIAL-001',
      name: 'Historical snapshot',
      category: product_category.CAR,
      category_id: null,
      category_ref: null,
      brand: null,
      model: null,
      manufacture_year: null,
      description: null,
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
        name: 'PPF X10',
        category: product_category.ACCESSORY,
        category_id: null,
        category_ref: null,
        brand: 'Demo',
        model: 'X10',
        manufacture_year: 2026,
        description: 'Shared description',
        default_warranty_duration_months: 36,
        default_warranty_terms: null,
        metadata: {
          specifications: [{ key: 'Thickness', value: '10 mil' }],
        },
        is_active: true,
        created_at: new Date('2026-07-25T00:00:00.000Z'),
        updated_at: new Date('2026-07-25T00:00:00.000Z'),
        assets: [],
      },
    });

    expect(response).toEqual(
      expect.objectContaining({
        name: 'PPF X10',
        category: product_category.ACCESSORY,
        brand: 'Demo',
        model: 'X10',
        description: 'Shared description',
        metadata: {
          specifications: [{ key: 'Thickness', value: '10 mil' }],
          installationPosition: 'Windshield',
        },
      }),
    );
  });
});
