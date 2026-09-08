import { ProductsRepository } from '@/modules/products/repository/products.repository';
import {
  asset_access_type,
  warranty_activation_request_status,
} from '@prisma/client';

describe('ProductsRepository', () => {
  it('keeps the transitional current warranty pointer after product creation', async () => {
    const create = jest.fn().mockResolvedValue({
      id: 'product-id',
      warranties: [{ id: 'warranty-id' }],
    });
    const update = jest.fn().mockResolvedValue({
      id: 'product-id',
      warranty: { id: 'warranty-id' },
    });
    const repository = new ProductsRepository({
      $transaction: jest.fn((work: (tx: unknown) => unknown) =>
        work({ product: { create, update } }),
      ),
    } as never);

    await repository.create({
      category_ref: { connect: { id: 'category-id' } },
      product_code: 'PRD-001',
      slug: 'prd-001',
      warranties: {
        create: {
          duration_months: 24,
          warranty_code: 'WM-001',
        },
      },
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { current_warranty_id: 'warranty-id' },
        where: { id: 'product-id' },
      }),
    );
  });

  it('loads all activation codes assigned to a product', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const repository = new ProductsRepository({
      product: { findUnique },
    } as never);

    await repository.findById('product-id');

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          activation_codes: {
            orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
            select: {
              id: true,
              code_ciphertext: true,
              status: true,
              expires_at: true,
              batch: { select: { batch_code: true } },
              request: { select: { id: true, status: true } },
              request_items: { select: { id: true, status: true } },
              warranty: { select: { id: true } },
            },
          },
          warranty_activation_requests: {
            select: { id: true, activation_code_id: true },
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
        slug: 'lex-sp50',
        is_published: true,
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
