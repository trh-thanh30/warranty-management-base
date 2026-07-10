import { ConflictError, NotFoundError } from '@/common/response';
import { UpdateCustomerUseCase } from '@/modules/customers/use-cases/update-customer.use-case';

describe('UpdateCustomerUseCase', () => {
  const createCustomersRepository = () => ({
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByPhone: jest.fn(),
    update: jest.fn(),
  });

  it('updates customer contact details', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue({ id: 'customer-id' });
    customersRepository.findByPhone.mockResolvedValue(null);
    customersRepository.findByEmail.mockResolvedValue(null);
    customersRepository.update.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS-2026-0001',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    const result = await useCase.execute('customer-id', {
      address: 'Ho Chi Minh City',
      email: 'user1@example.com',
      phone: '0987654311',
    });

    expect(customersRepository.findByPhone).toHaveBeenCalledWith(
      '0987654311',
      'customer-id',
    );
    expect(customersRepository.findByEmail).toHaveBeenCalledWith(
      'user1@example.com',
      'customer-id',
    );
    expect(result.phone).toBe('0987654311');
    expect(result.email).toBe('user1@example.com');
  });

  it('throws when customer does not exist', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    await expect(
      useCase.execute('customer-id', { fullName: 'Nguyen Van Hung' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('prevents updating to duplicate phone', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue({ id: 'customer-id' });
    customersRepository.findByPhone.mockResolvedValue({ id: 'existing-id' });
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    await expect(
      useCase.execute('customer-id', { phone: '0987654311' }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(customersRepository.update).not.toHaveBeenCalled();
  });

  it('prevents updating to duplicate email', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue({ id: 'customer-id' });
    customersRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    await expect(
      useCase.execute('customer-id', { email: 'user1@example.com' }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(customersRepository.update).not.toHaveBeenCalled();
  });
});
