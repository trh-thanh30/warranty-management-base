import { NotFoundError } from '@/common/response';
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

    expect(customersRepository.findByPhone).not.toHaveBeenCalled();
    expect(customersRepository.findByEmail).not.toHaveBeenCalled();
    expect(result.phone).toBe('0987654311');
    expect(result.email).toBe('user1@example.com');
  });

  it('clears a customer birthdate explicitly', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue({ id: 'customer-id' });
    customersRepository.update.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS-2026-0001',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
      birthdate: null,
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    const result = await useCase.execute('customer-id', { birthdate: null });

    expect(customersRepository.update).toHaveBeenCalledWith(
      'customer-id',
      expect.objectContaining({ birthdate: null }),
    );
    expect(result.birthdate).toBeNull();
  });

  it('throws when customer does not exist', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    await expect(
      useCase.execute('customer-id', { fullName: 'Nguyen Van Hung' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows updating to duplicate phone', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue({ id: 'customer-id' });
    customersRepository.findByPhone.mockResolvedValue({ id: 'existing-id' });
    customersRepository.update.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS-2026-0001',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
      birthdate: null,
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    await useCase.execute('customer-id', { phone: '0987654311' });

    expect(customersRepository.findByPhone).not.toHaveBeenCalled();
    expect(customersRepository.update).toHaveBeenCalled();
  });

  it('allows updating to a shared delivery email', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findById.mockResolvedValue({ id: 'customer-id' });
    customersRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });
    customersRepository.update.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS-2026-0001',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'shared-dealer@example.com',
      address: 'Ho Chi Minh City',
      birthdate: null,
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const useCase = new UpdateCustomerUseCase(customersRepository as never);

    await useCase.execute('customer-id', {
      email: 'shared-dealer@example.com',
    });

    expect(customersRepository.findByEmail).not.toHaveBeenCalled();
    expect(customersRepository.update).toHaveBeenCalledWith(
      'customer-id',
      expect.objectContaining({ email: 'shared-dealer@example.com' }),
    );
  });
});
