import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';

describe('GenerateCustomerCodeUseCase', () => {
  const createCustomersRepository = () => ({
    findLastCustomerCode: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts at CUS000001 when no prior customer code exists', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findLastCustomerCode.mockResolvedValue(null);
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    await expect(useCase.generateCustomerCode()).resolves.toBe('CUS000001');
    expect(customersRepository.findLastCustomerCode).toHaveBeenCalledWith(
      'CUS',
    );
  });

  it('uses the supplied transaction client to read the last code', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findLastCustomerCode.mockResolvedValue(null);
    const tx = { customer: {} };
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    await expect(useCase.execute(tx as never)).resolves.toBe('CUS000001');
    expect(customersRepository.findLastCustomerCode).toHaveBeenCalledWith(
      'CUS',
      tx,
    );
  });

  it('generates a sequential batch after the last customer code', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findLastCustomerCode.mockResolvedValue({
      customer_code: 'CUS000099',
    });
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    await expect(useCase.generateCustomerCodeBatch(3)).resolves.toEqual([
      'CUS000100',
      'CUS000101',
      'CUS000102',
    ]);
  });

  it('keeps execute as a compatibility alias for single code generation', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findLastCustomerCode.mockResolvedValue({
      customer_code: 'CUS000001',
    });
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    await expect(useCase.execute()).resolves.toBe('CUS000002');
  });

  it('starts a new sequential range when the last matching code is legacy format', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findLastCustomerCode.mockResolvedValue({
      customer_code: 'CUS-2026-ABCD',
    });
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    await expect(useCase.generateCustomerCode()).resolves.toBe('CUS000001');
  });
});
