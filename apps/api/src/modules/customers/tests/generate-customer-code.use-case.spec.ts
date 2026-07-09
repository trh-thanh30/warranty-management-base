import { BadRequestError } from '@/common/response';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';

describe('GenerateCustomerCodeUseCase', () => {
  const createCustomersRepository = () => ({
    findByCustomerCode: jest.fn(),
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-09T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns the first unique generated customer code', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue(null);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    const result = await useCase.execute();

    expect(result).toBe('CUS-2026-4FZY');
    expect(customersRepository.findByCustomerCode).toHaveBeenCalledWith(
      'CUS-2026-4FZY',
    );
  });

  it('retries when a generated customer code already exists', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode
      .mockResolvedValueOnce({ id: 'existing-customer-id' })
      .mockResolvedValueOnce(null);
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.123456)
      .mockReturnValueOnce(0.654321);
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    const result = await useCase.execute();

    expect(result).toBe('CUS-2026-NK00');
    expect(customersRepository.findByCustomerCode).toHaveBeenNthCalledWith(
      1,
      'CUS-2026-4FZY',
    );
    expect(customersRepository.findByCustomerCode).toHaveBeenNthCalledWith(
      2,
      'CUS-2026-NK00',
    );
  });

  it('throws when a unique customer code cannot be generated', async () => {
    const customersRepository = createCustomersRepository();
    customersRepository.findByCustomerCode.mockResolvedValue({
      id: 'existing-customer-id',
    });
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);
    const useCase = new GenerateCustomerCodeUseCase(
      customersRepository as never,
    );

    await expect(useCase.execute()).rejects.toBeInstanceOf(BadRequestError);
    expect(customersRepository.findByCustomerCode).toHaveBeenCalledTimes(5);
  });
});
