import { getActivationProductEligibility } from '@/modules/products/product-activation-eligibility';
import { ListActivationProductOptionsUseCase } from '@/modules/products/use-cases/list-activation-product-options.use-case';
import {
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

describe('ListActivationProductOptionsUseCase', () => {
  it('keeps the catalogue product selectable when another request is pending', async () => {
    const product = createProduct({
      warranty_activation_request_items: [
        {
          status: warranty_activation_request_status.PENDING,
          request: {
            request_code: 'WAR-20260827-0001',
            status: warranty_activation_request_status.PENDING,
          },
        },
      ],
    });
    const repository = {
      listActivationOptions: jest.fn().mockResolvedValue({
        items: [product],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    };
    const useCase = new ListActivationProductOptionsUseCase(
      repository as never,
    );

    const result = await useCase.execute({
      categoryId: '51a1cdf0-0c38-42dd-8892-f97164cc0f0f',
    });

    expect(result.items[0]?.activationEligibility).toEqual({
      eligible: true,
      reason: null,
      requestCode: null,
    });
  });

  it.each([
    {
      expected: 'PRODUCT_DELETED',
      patch: { deleted_at: new Date() },
    },
    {
      expected: 'PRODUCT_INACTIVE',
      patch: { status: product_status.INACTIVE },
    },
    {
      expected: 'WARRANTY_MISSING',
      patch: { warranty: null, warranty_duration_months: null },
    },
  ])('returns $expected for an ineligible product', ({ expected, patch }) => {
    expect(getActivationProductEligibility(createProduct(patch))).toEqual({
      eligible: false,
      reason: expected,
      requestCode: null,
    });
  });

  it('keeps the catalogue product selectable when another request is approved', () => {
    const product = createProduct({
      warranty_activation_requests: [
        {
          id: 'request-id',
          request_code: 'WAR-20260827-0002',
          status: warranty_activation_request_status.APPROVED,
        },
      ],
    });

    expect(getActivationProductEligibility(product)).toEqual({
      eligible: true,
      reason: null,
      requestCode: null,
    });
  });

  it('marks an active catalogue product with a warranty policy as eligible', () => {
    expect(getActivationProductEligibility(createProduct())).toEqual({
      eligible: true,
      reason: null,
      requestCode: null,
    });
  });

  it('keeps a product eligible when another activation code is available', () => {
    expect(
      getActivationProductEligibility(
        createProduct({
          warranty: createWarranty({ status: warranty_status.ACTIVE }),
          activation_codes: [
            {
              status: 'AVAILABLE',
              expires_at: new Date('2026-12-31T00:00:00.000Z'),
              request: null,
              request_items: [],
            },
          ],
        }),
      ),
    ).toEqual({ eligible: true, reason: null, requestCode: null });
  });

  it('keeps an active code-less product eligible for a new warranty request', () => {
    expect(
      getActivationProductEligibility(
        createProduct({
          warranty: createWarranty({ status: warranty_status.ACTIVE }),
          category_ref: { activation_code_enabled: false },
        }),
      ),
    ).toEqual({ eligible: true, reason: null, requestCode: null });
  });
});

function createProduct(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-08-27T00:00:00.000Z');
  return {
    id: 'product-id',
    category_id: 'category-id',
    product_code: 'PRD-001',
    serial_number: 'SN-001',
    display_name: 'Film kính lái',
    status: product_status.ACTIVE,
    metadata: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    assets: [],
    ownerships: [],
    template: null,
    category_ref: undefined,
    warranty: createWarranty(),
    warranty_activation_requests: [],
    warranty_activation_request_items: [],
    warranty_duration_months: 24,
    ...overrides,
  };
}

function createWarranty(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-08-27T00:00:00.000Z');
  return {
    id: 'warranty-id',
    product_id: 'product-id',
    warranty_code: 'WM-2026-001',
    start_date: null,
    end_date: null,
    duration_months: 24,
    coverage_limit_amount: null,
    max_claim_count: null,
    max_amount_per_claim: null,
    status: warranty_status.DRAFT,
    terms: null,
    metadata: null,
    activated_by_id: null,
    voided_at: null,
    voided_by_id: null,
    void_reason: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}
