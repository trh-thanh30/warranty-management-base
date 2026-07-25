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
});
