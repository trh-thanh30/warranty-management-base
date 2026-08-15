import { ProductsRepository } from '@/modules/products/repository/products.repository';

describe('ProductsRepository.findActivationRequestTargetsByIds', () => {
  it('loads non-deleted physical products with warranty and current owner', async () => {
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
        template: true,
        ownerships: expect.objectContaining({
          where: { is_current_owner: true },
        }),
      }),
    });
  });
});
