import { BadRequestError } from '@/common/response';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';

describe('GenerateWarrantyCodeUseCase', () => {
  const productsRepository = {
    findByWarrantyCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a unique warranty code with the expected prefix', async () => {
    productsRepository.findByWarrantyCode.mockResolvedValue(null);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const useCase = new GenerateWarrantyCodeUseCase(
      productsRepository as never,
    );

    const code = await useCase.execute(new Date('2026-06-14T00:00:00.000Z'));

    expect(code).toMatch(/^WM-2026-[A-Z0-9]{6}$/);
    expect(productsRepository.findByWarrantyCode).toHaveBeenCalledWith(code);
  });

  it('retries and fails after repeated collisions', async () => {
    productsRepository.findByWarrantyCode.mockResolvedValue({
      id: 'product-id',
    });
    const useCase = new GenerateWarrantyCodeUseCase(
      productsRepository as never,
    );

    await expect(
      useCase.execute(new Date('2026-06-14T00:00:00.000Z')),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(productsRepository.findByWarrantyCode).toHaveBeenCalledTimes(5);
  });
});
