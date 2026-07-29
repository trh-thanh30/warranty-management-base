import { BadRequestError } from '@/common/response';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';

describe('GenerateProductCodeUseCase', () => {
  const productsRepository = {
    findByProductCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a unique product code with the expected prefix', async () => {
    productsRepository.findByProductCode.mockResolvedValue(null);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const useCase = new GenerateProductCodeUseCase(productsRepository as never);

    const code = await useCase.execute(new Date('2026-06-14T00:00:00.000Z'));

    expect(code).toMatch(/^PRD-2026-[A-Z0-9]{6}$/);
    expect(productsRepository.findByProductCode).toHaveBeenCalledWith(code);
  });

  it('uses the supplied transaction client for collision checks', async () => {
    productsRepository.findByProductCode.mockResolvedValue(null);
    const tx = { product: {} };
    const useCase = new GenerateProductCodeUseCase(productsRepository as never);

    const code = await useCase.execute(
      new Date('2026-06-14T00:00:00.000Z'),
      tx as never,
    );

    expect(productsRepository.findByProductCode).toHaveBeenCalledWith(code, tx);
  });

  it('retries and fails after repeated collisions', async () => {
    productsRepository.findByProductCode.mockResolvedValue({
      id: 'product-id',
    });
    const useCase = new GenerateProductCodeUseCase(productsRepository as never);

    await expect(
      useCase.execute(new Date('2026-06-14T00:00:00.000Z')),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(productsRepository.findByProductCode).toHaveBeenCalledTimes(5);
  });

  it('generates distinct codes for a batch even when randomness repeats', async () => {
    productsRepository.findByProductCode.mockResolvedValue(null);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const useCase = new GenerateProductCodeUseCase(productsRepository as never);

    const codes = await useCase.executeBatch(
      3,
      new Date('2026-06-14T00:00:00.000Z'),
    );

    expect(codes).toEqual([
      'PRD-2026-AAAAAA',
      'PRD-2026-AAAAAB',
      'PRD-2026-AAAAAC',
    ]);
    expect(new Set(codes).size).toBe(3);
  });
});
