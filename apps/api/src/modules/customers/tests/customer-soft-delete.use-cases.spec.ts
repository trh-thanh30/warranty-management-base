import { RestoreCustomerUseCase } from '@/modules/customers/use-cases/restore-customer.use-case';
import { SoftDeleteCustomerUseCase } from '@/modules/customers/use-cases/soft-delete-customer.use-case';

const baseCustomer = {
  id: 'customer-id',
  user_id: null,
  customer_code: 'CUS000001',
  full_name: 'Customer',
  phone: null,
  email: null,
  address: null,
  birthdate: null,
  metadata: null,
  created_at: new Date('2026-08-01T00:00:00.000Z'),
  updated_at: new Date('2026-08-01T00:00:00.000Z'),
};

describe('Customer soft-delete lifecycle', () => {
  it('soft-deletes an active customer and returns the application response', async () => {
    const repository = {
      findById: jest
        .fn()
        .mockResolvedValue({ ...baseCustomer, deleted_at: null }),
      update: jest.fn().mockResolvedValue({
        ...baseCustomer,
        deleted_at: new Date('2026-08-27T00:00:00.000Z'),
      }),
    };
    const useCase = new SoftDeleteCustomerUseCase(repository as never);

    await expect(useCase.execute('customer-id')).resolves.toMatchObject({
      id: 'customer-id',
      status: 'DELETED',
    });
    expect(repository.update).toHaveBeenCalledWith('customer-id', {
      deleted_at: expect.any(Date),
    });
  });

  it('restores a deleted customer and is idempotent for active customers', async () => {
    const repository = {
      findById: jest
        .fn()
        .mockResolvedValueOnce({
          ...baseCustomer,
          deleted_at: new Date('2026-08-27T00:00:00.000Z'),
        })
        .mockResolvedValueOnce({ ...baseCustomer, deleted_at: null }),
      update: jest
        .fn()
        .mockResolvedValue({ ...baseCustomer, deleted_at: null }),
    };
    const useCase = new RestoreCustomerUseCase(repository as never);

    await expect(useCase.execute('customer-id')).resolves.toMatchObject({
      status: 'ACTIVE',
    });
    await expect(useCase.execute('customer-id')).resolves.toMatchObject({
      status: 'ACTIVE',
    });
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith('customer-id', {
      deleted_at: null,
    });
  });
});
