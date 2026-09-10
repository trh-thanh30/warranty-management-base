import { ProductsRepository } from '@/modules/products/repository/products.repository';

describe('ProductsRepository.findActivationRequestTargetsByIds', () => {
  it('loads non-deleted catalogue products with warranty policy data', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new ProductsRepository({
      product: { findMany },
    } as never);

    await repository.findActivationRequestTargetsByIds([
      'product-a',
      'product-b',
    ]);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        id: { in: ['product-a', 'product-b'] },
      },
      include: expect.objectContaining({
        warranty: true,
        category_ref: true,
      }),
    });
  });
});
