import { ProductsRepository } from '@/modules/products/repository/products.repository';

describe('ProductsRepository.list', () => {
  it('includes soft-deleted products in the admin product list by default', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({
          product: {
            count,
            findMany,
          },
        }),
      ),
    };
    const repository = new ProductsRepository(prismaService as never);

    await repository.list({ limit: 10, page: 1 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          deleted_at: null,
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.not.objectContaining({
        deleted_at: null,
      }),
    });
  });
});
