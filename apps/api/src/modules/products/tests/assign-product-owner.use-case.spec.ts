import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';

const now = new Date('2026-09-04T00:00:00.000Z');

function setup(options?: { product?: unknown; customer?: unknown }) {
  const product =
    options && 'product' in options
      ? options.product
      : {
          id: 'product-id',
          deleted_at: null,
          warranty: { id: 'warranty-id', warranty_code: 'WM-LEGACY' },
        };
  const customer =
    options && 'customer' in options
      ? options.customer
      : { id: 'customer-id', user_id: null };
  const returnedProduct = {
    id: 'product-id',
    category_id: 'category-id',
    current_warranty_id: 'warranty-id',
    product_code: 'PRD-001',
    serial_number: 'SN-001',
    display_name: 'Camera',
    slug: 'camera-prd-001',
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
    warranty: {
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
    },
  };
  const tx = {
    productOwnership: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({ id: 'ownership-id' }),
    },
    product: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(returnedProduct),
    },
    warranty: { update: jest.fn() },
  };
  const prisma = {
    product: { findUnique: jest.fn().mockResolvedValue(product) },
    customer: { findUnique: jest.fn().mockResolvedValue(customer) },
    $transaction: jest.fn(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    ),
  };
  const useCase = new AssignProductOwnerUseCase(prisma as never);

  return { tx, useCase };
}

describe('AssignProductOwnerUseCase', () => {
  it('assigns an owner to an issued legacy Warranty without changing its code', async () => {
    const { tx, useCase } = setup();

    await useCase.execute('product-id', {
      customerId: 'customer-id',
      purchaseDate: '2026-09-01',
    });

    expect(tx.warranty.update).not.toHaveBeenCalled();
    expect(tx.productOwnership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        product_id: 'product-id',
        customer_id: 'customer-id',
      }),
    });
  });

  it('does not issue a Warranty while assigning ownership', async () => {
    const { useCase } = setup({
      product: { id: 'product-id', deleted_at: null, warranty: null },
    });

    await expect(
      useCase.execute('product-id', { customerId: 'customer-id' }),
    ).rejects.toThrow('Warranty not found');
  });

  it('rejects a missing customer', async () => {
    const { useCase } = setup({ customer: null });

    await expect(
      useCase.execute('product-id', { customerId: 'missing-customer' }),
    ).rejects.toThrow('Customer not found');
  });

  it('rejects a missing product', async () => {
    const { useCase } = setup({ product: null });

    await expect(
      useCase.execute('missing-product', { customerId: 'customer-id' }),
    ).rejects.toThrow('Product not found');
  });
});
