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

  it('always limits the public list to visible active products', async () => {
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

    await repository.listPublic({ limit: 12, page: 1 });

    const visibilityFilter = {
      category_id: undefined,
      category_ref: { is_active: true },
      deleted_at: null,
      status: 'ACTIVE',
      template: {
        is: {
          is_published: true,
        },
      },
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
