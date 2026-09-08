import { TransferWarrantyOwnerUseCase } from '@/modules/warranties/use-cases/transfer-warranty-owner.use-case';

describe('TransferWarrantyOwnerUseCase', () => {
  const warranty = {
    id: 'warranty-1',
    status: 'ACTIVE',
  };

  function setup() {
    const transferred = {
      id: 'warranty-1',
      product_id: 'product-1',
      warranty_code: 'WM-1',
      status: 'ACTIVE',
      duration_months: 12,
      coverage_limit_amount: null,
      max_claim_count: null,
      max_amount_per_claim: null,
      start_date: new Date('2026-01-01'),
      end_date: new Date('2027-01-01'),
      terms: null,
      metadata: {},
      activated_by_id: null,
      voided_at: null,
      voided_by_id: null,
      void_reason: null,
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
      dealer_id: null,
      activation_code_id: null,
      activated_by: null,
      voided_by: null,
      dealer: null,
      ownerships: [
        {
          customer_id: 'customer-2',
          owner_user_id: null,
          is_current_owner: true,
          customer: {
            customer_code: 'CUS-2',
            full_name: 'New owner',
          },
        },
      ],
      product: {
        id: 'product-1',
        product_code: 'PRD-1',
        display_name: 'Product',
        serial_number: null,
        brand: null,
        model: null,
        category_ref: { name: 'Category', brand: null, model: null },
        ownerships: [],
      },
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(warranty),
      withTransaction: jest.fn().mockImplementation((callback) =>
        callback({
          transferWarrantyOwnership: jest.fn().mockResolvedValue(transferred),
        }),
      ),
    };
    return {
      repository,
      useCase: new TransferWarrantyOwnerUseCase(repository as never),
    };
  }

  it('transfers ownership through the warranty transaction repository', async () => {
    const { repository, useCase } = setup();

    const result = await useCase.execute('warranty-1', {
      customerId: 'customer-2',
      purchaseDate: '2026-09-01',
    });

    expect(repository.withTransaction).toHaveBeenCalled();
    expect(result.owner?.customerId).toBe('customer-2');
  });

  it('rejects missing warranties', async () => {
    const { useCase, repository } = setup();
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { customerId: 'customer-2' }),
    ).rejects.toThrow('Warranty not found');
  });

  it('rejects expired warranties', async () => {
    const { useCase, repository } = setup();
    repository.findById.mockResolvedValue({ ...warranty, status: 'EXPIRED' });

    await expect(
      useCase.execute('warranty-1', { customerId: 'customer-2' }),
    ).rejects.toThrow('Expired or voided warranties cannot change owner');
  });
});
