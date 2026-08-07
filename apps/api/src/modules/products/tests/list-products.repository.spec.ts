import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { product_status } from '@prisma/client';

describe('ProductsRepository.list', () => {
  it('excludes soft-deleted products from the admin product list by default', async () => {
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
        where: expect.objectContaining({ deleted_at: null }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({ deleted_at: null }),
    });
  });

  it('only includes soft-deleted products when filtering by deleted status', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ product: { count, findMany } }),
      ),
    };
    const repository = new ProductsRepository(prismaService as never);

    await repository.list({
      limit: 10,
      page: 1,
      status: product_status.DELETED,
    });

    const deletedFilter = {
      deleted_at: { not: null },
      status: product_status.DELETED,
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining(deletedFilter),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining(deletedFilter),
    });
  });

  it('filters products by current owner customer id', async () => {
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

    await repository.list({
      limit: 10,
      ownerCustomerId: 'customer-1',
      page: 1,
    });

    const expectedOwnerFilter = {
      some: {
        customer_id: 'customer-1',
        is_current_owner: true,
      },
    };

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerships: expectedOwnerFilter,
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        ownerships: expectedOwnerFilter,
      }),
    });
  });

  it('filters physical products by product template id', async () => {
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

    await repository.list({
      limit: 10,
      page: 1,
      templateId: 'template-1',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          template_id: 'template-1',
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        template_id: 'template-1',
      }),
    });
  });

  it('filters products by the editable product category', async () => {
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

    await repository.list({
      categoryId: 'override-category-id',
      limit: 10,
      page: 1,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: [{ category_id: 'override-category-id' }],
        }),
      }),
    );
  });

  it('filters the admin product list by publication state', async () => {
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

    await repository.list({
      isPublished: 'true',
      limit: 10,
      page: 1,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          template: { is: { is_published: true } },
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        template: { is: { is_published: true } },
      }),
    });
  });

  it('applies the same soft-delete visibility rule to product exports', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new ProductsRepository({
      product: { findMany },
    } as never);

    await repository.listForExport({});
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deleted_at: null }),
      }),
    );

    await repository.listForExport({ status: product_status.DELETED });
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deleted_at: { not: null },
          status: product_status.DELETED,
        }),
      }),
    );
  });

  it('paginates visible product templates instead of physical products', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({
          productTemplate: {
            count,
            findMany,
          },
        }),
      ),
    };
    const repository = new ProductsRepository(prismaService as never);

    await repository.listPublic({
      categoryId: 'category-id',
      limit: 12,
      page: 1,
    });

    const visibilityFilter = {
      category_id: 'category-id',
      category_ref: { is_active: true },
      is_active: true,
      is_published: true,
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining(visibilityFilter),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining(visibilityFilter),
    });
  });
});
