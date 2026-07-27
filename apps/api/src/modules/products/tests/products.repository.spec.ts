import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { warranty_activation_request_status } from '@prisma/client';

describe('ProductsRepository', () => {
  it('loads at most one open activation request with a product', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const repository = new ProductsRepository({
      product: { findUnique },
    } as never);

    await repository.findById('product-id');

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          warranty_activation_requests: {
            select: { id: true },
            take: 1,
            where: {
              status: {
                in: [
                  warranty_activation_request_status.PENDING,
                  warranty_activation_request_status.APPROVED,
                ],
              },
            },
          },
        }),
        where: { id: 'product-id' },
      }),
    );
  });
});
