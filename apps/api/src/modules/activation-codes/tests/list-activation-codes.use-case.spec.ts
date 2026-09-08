import { ListActivationCodesUseCase } from '@/modules/activation-codes/use-cases/list-activation-codes.use-case';

describe('ListActivationCodesUseCase by product', () => {
  it('forwards product id and filters to the repository', async () => {
    const result = { items: [], meta: { page: 1, total: 0 } };
    const repository = {
      listCodes: jest.fn().mockResolvedValue(result),
    };
    const filters = { page: 2, limit: 25, status: 'AVAILABLE' as const };

    await expect(
      new ListActivationCodesUseCase(repository as never).executeByProduct(
        'product-1',
        filters,
      ),
    ).resolves.toBe(result);
    expect(repository.listCodes).toHaveBeenCalledWith(
      'product-1',
      filters,
      'product',
    );
  });

  it('rejects when the product does not exist', async () => {
    const repository = {
      listCodes: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new ListActivationCodesUseCase(repository as never).executeByProduct(
        'missing-product',
        {},
      ),
    ).rejects.toThrow('Product not found');
  });
});
