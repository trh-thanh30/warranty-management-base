import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import type { WarrantyClaimWithRelations } from '@/modules/warranty-claims/types/warranty-claim.types';

describe('toWarrantyClaimResponse', () => {
  it('keeps the dynamic product category and full warranty detail', () => {
    const now = new Date('2026-07-24T00:00:00.000Z');
    const claim = {
      id: 'claim-id',
      claim_code: 'CLM000001',
      warranty_id: 'warranty-id',
      product_id: 'product-id',
      customer_id: null,
      warranty_code: 'WM-2026-TEST',
      requester_name: 'Customer',
      requester_phone: '0900000000',
      issue_title: 'Issue',
      issue_detail: null,
      status: 'SUBMITTED',
      priority: 'NORMAL',
      due_at: null,
      sla_breached_at: null,
      metadata: null,
      submitted_at: now,
      resolved_at: null,
      created_at: now,
      updated_at: now,
      product: {
        id: 'product-id',
        category_id: 'category-id',
        category_ref: {
          id: 'category-id',
          type: 'PRODUCT',
          code: 'FILM',
          slug: 'film',
          name: 'Phim cách nhiệt',
          description: null,
          parent_id: null,
          icon: null,
          image_url: null,
          order: 1,
          is_active: true,
          metadata: null,
          created_at: now,
          updated_at: now,
        },
        product_code: 'PRD-2026-TEST',
        display_name: null,
        serial_number: 'SERIAL-1',
        catalogue_name: 'Test product',
        catalogue_sku: 'PRD-2026-TEST',
        catalogue_slug: 'test-product',
        catalogue_brand: 'Brand',
        catalogue_model: 'Model',
        catalogue_model_year: 2026,
        catalogue_description: null,
        catalogue_metadata: null,
        catalogue_is_published: false,
        catalogue_published_at: null,
        status: 'ACTIVE',
        metadata: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      warranty: {
        id: 'warranty-id',
        warranty_code: 'WM-2026-TEST',
        start_date: now,
        end_date: new Date('2029-07-24T00:00:00.000Z'),
        duration_months: 36,
        coverage_limit_amount: { toString: () => '50000000' },
        max_claim_count: 3,
        max_amount_per_claim: { toString: () => '10000000' },
        status: 'ACTIVE',
        terms: 'Warranty terms',
      },
      customer: null,
      service_center: null,
      status_history: [],
    } as unknown as WarrantyClaimWithRelations;

    const result = toWarrantyClaimResponse(claim);

    expect(result.product).toEqual(
      expect.objectContaining({
        categoryId: 'category-id',
        categoryRef: expect.objectContaining({
          id: 'category-id',
          name: 'Phim cách nhiệt',
        }),
        modelYear: 2026,
      }),
    );
    expect(result.warranty).toEqual(
      expect.objectContaining({
        durationMonths: 36,
        coverageLimitAmount: '50000000',
        maxClaimCount: 3,
        maxAmountPerClaim: '10000000',
        terms: 'Warranty terms',
      }),
    );
  });
});
