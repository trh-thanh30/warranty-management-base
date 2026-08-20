import { ConflictError, NotFoundError } from '@/common/response';
import { CreateCustomerUseCase } from '@/modules/customers/use-cases/create-customer.use-case';

describe('CreateCustomerUseCase', () => {
  const createCustomersRepository = () => ({
    create: jest.fn(),
    findByUserId: jest.fn(),
    findByCustomerCode: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
  });

  const createPrismaService = () => ({
    user: {
      findUnique: jest.fn(),
    },
  });

  const createGenerateCustomerCodeUseCase = () => ({
    execute: jest.fn(),
  });

  it('creates a customer profile without a user account', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    customersRepository.findByPhone.mockResolvedValue(null);
    customersRepository.findByEmail.mockResolvedValue(null);
    customersRepository.create.mockResolvedValue({
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
    const prismaService = createPrismaService();
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    const result = await useCase.execute({
      customerCode: 'CUS-2026-0001',
      fullName: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
    });

    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    expect(generateCustomerCodeUseCase.execute).not.toHaveBeenCalled();
    expect(customersRepository.findByUserId).not.toHaveBeenCalled();
    expect(customersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: undefined,
        customer_code: 'CUS-2026-0001',
        full_name: 'Nguyen Van Hung',
      }),
    );
    expect(result.userId).toBeNull();
  });

  it('stores an optional customer birthdate', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    customersRepository.findByPhone.mockResolvedValue(null);
    customersRepository.findByEmail.mockResolvedValue(null);
    customersRepository.create.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS-2026-0001',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
      birthdate: new Date('2005-12-11T00:00:00.000Z'),
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      createPrismaService() as never,
      createGenerateCustomerCodeUseCase() as never,
    );

    const result = await useCase.execute({
      address: 'Ho Chi Minh City',
      birthdate: '2005-12-11',
      customerCode: 'CUS-2026-0001',
      email: 'user1@example.com',
      fullName: 'Nguyen Van Hung',
      phone: '0987654311',
    });

    expect(customersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        birthdate: new Date('2005-12-11T00:00:00.000Z'),
      }),
    );
    expect(result.birthdate).toEqual(new Date('2005-12-11T00:00:00.000Z'));
  });

  it('validates userId when linking to an existing account', async () => {
    const customersRepository = createCustomersRepository();
    const prismaService = createPrismaService();
    prismaService.user.findUnique.mockResolvedValue(null);
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    await expect(
      useCase.execute({
        address: 'Ho Chi Minh City',
        email: 'user1@example.com',
        userId: '00000000-0000-4000-8000-000000000001',
        fullName: 'Nguyen Van Hung',
        phone: '0987654311',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('uses provided phone and email when linked to an account', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByUserId.mockResolvedValue(null);
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    customersRepository.findByPhone.mockResolvedValue(null);
    customersRepository.findByEmail.mockResolvedValue(null);
    customersRepository.create.mockResolvedValue({
      id: 'customer-id',
      user_id: '00000000-0000-4000-8000-000000000001',
      customer_code: 'CUS-2026-0002',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const prismaService = createPrismaService();
    prismaService.user.findUnique.mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000001',
      phone: '0987654311',
      email: 'user1@example.com',
    });
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    const result = await useCase.execute({
      customerCode: 'CUS-2026-0002',
      address: 'Ho Chi Minh City',
      email: 'user1@example.com',
      fullName: 'Nguyen Van Hung',
      phone: '0987654311',
      userId: '00000000-0000-4000-8000-000000000001',
    });

    expect(customersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user1@example.com',
        phone: '0987654311',
        user: { connect: { id: '00000000-0000-4000-8000-000000000001' } },
      }),
    );
    expect(result.email).toBe('user1@example.com');
    expect(result.phone).toBe('0987654311');
  });

  it('prevents creating another customer profile for the same account', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByUserId.mockResolvedValue({ id: 'customer-id' });
    const prismaService = createPrismaService();
    prismaService.user.findUnique.mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000001',
      phone: null,
      email: null,
    });
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    await expect(
      useCase.execute({
        address: 'Ho Chi Minh City',
        email: 'user1@example.com',
        userId: '00000000-0000-4000-8000-000000000001',
        fullName: 'Nguyen Van Hung',
        phone: '0987654311',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('generates a customer code when omitted', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    customersRepository.findByPhone.mockResolvedValue(null);
    customersRepository.findByEmail.mockResolvedValue(null);
    customersRepository.create.mockResolvedValue({
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS-2026-ABCD',
      full_name: 'Nguyen Van Hung',
      phone: '0987654311',
      email: 'user1@example.com',
      address: 'Ho Chi Minh City',
      metadata: null,
      created_at: new Date('2026-07-09T00:00:00.000Z'),
      updated_at: new Date('2026-07-09T00:00:00.000Z'),
    });
    const prismaService = createPrismaService();
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    generateCustomerCodeUseCase.execute.mockResolvedValue('CUS-2026-ABCD');
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    const result = await useCase.execute({
      address: 'Ho Chi Minh City',
      email: 'user1@example.com',
      fullName: 'Nguyen Van Hung',
      phone: '0987654311',
    });

    expect(generateCustomerCodeUseCase.execute).toHaveBeenCalledTimes(1);
    expect(customersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_code: 'CUS-2026-ABCD',
      }),
    );
    expect(result.customerCode).toBe('CUS-2026-ABCD');
  });

  it('prevents creating a customer with duplicate phone', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    customersRepository.findByPhone.mockResolvedValue({ id: 'existing-id' });
    const prismaService = createPrismaService();
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    await expect(
      useCase.execute({
        customerCode: 'CUS-2026-0003',
        address: 'Ho Chi Minh City',
        email: 'user3@example.com',
        fullName: 'Nguyen Van Hung',
        phone: '0987654311',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(customersRepository.create).not.toHaveBeenCalled();
  });

  it('prevents creating a customer with duplicate email', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    customersRepository.findByPhone.mockResolvedValue(null);
    customersRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });
    const prismaService = createPrismaService();
    const generateCustomerCodeUseCase = createGenerateCustomerCodeUseCase();
    const useCase = new CreateCustomerUseCase(
      customersRepository as never,
      prismaService as never,
      generateCustomerCodeUseCase as never,
    );

    await expect(
      useCase.execute({
        customerCode: 'CUS-2026-0004',
        address: 'Ho Chi Minh City',
        email: 'user1@example.com',
        fullName: 'Nguyen Van Hung',
        phone: '0987654312',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(customersRepository.create).not.toHaveBeenCalled();
  });
});
