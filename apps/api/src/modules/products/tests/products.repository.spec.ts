import { ProductsRepository } from '@/modules/products/repository/products.repository';
import {
  asset_access_type,
  warranty_activation_request_status,
} from '@prisma/client';

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

  it('finds public detail by published product slug', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new ProductsRepository({
      product: { findFirst },
    } as never);

    await repository.findPublicProductBySlug('lex-sp50');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        catalogue_slug: 'lex-sp50',
        catalogue_is_published: true,
        deleted_at: null,
        status: 'ACTIVE',
        category_ref: { is_active: true },
      },
      include: {
        category_ref: true,
        warranty: true,
        assets: {
          where: {
            asset: {
              access_type: asset_access_type.PUBLIC,
              is_deleted: false,
            },
          },
          include: { asset: true },
          orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
        },
      },
    });
  });
});
