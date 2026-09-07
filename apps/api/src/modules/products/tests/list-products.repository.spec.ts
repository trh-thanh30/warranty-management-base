import { ProductsRepository } from '@/modules/products/repository/products.repository';
import {
  product_status,
  warranty_activation_request_status,
  warranty_claim_status,
  warranty_status,
} from '@prisma/client';

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
        where: expect.objectContaining({
          deleted_at: null,
          status: product_status.ACTIVE,
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        deleted_at: null,
        status: product_status.ACTIVE,
      }),
    });
  });

  it('does not filter product status or deletion state when status is all', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new ProductsRepository({
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ product: { count, findMany } }),
      ),
    } as never);

    await repository.list({ limit: 10, page: 1, status: 'ALL' });

    const where = findMany.mock.calls[0]?.[0].where;
    expect(where.status).toBeUndefined();
    expect(where.deleted_at).toBeUndefined();
    expect(count).toHaveBeenCalledWith({ where });
  });

  it('sorts the admin product list by newest creation date and id by default', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ product: { count, findMany } }),
      ),
    };
    const repository = new ProductsRepository(prismaService as never);

    await repository.list({ limit: 10, page: 1 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('keeps a selected product sort before creation date and id tie-breakers', async () => {
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
      sortBy: 'status',
      sortOrder: 'asc',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ status: 'asc' }, { created_at: 'desc' }, { id: 'desc' }],
      }),
    );
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

  it('filters activation-code assignment pickers to assignable products', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new ProductsRepository({
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ product: { count, findMany } }),
      ),
    } as never);

    await repository.list({
      activationCodeAssignable: 'true',
      limit: 20,
      page: 1,
      status: product_status.ACTIVE,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { category_ref: { activation_code_enabled: true } },
            { warranty_duration_months: { gt: 0 } },
            { activation_codes: { none: {} } },
          ]),
          deleted_at: null,
          status: product_status.ACTIVE,
        }),
      }),
    );
  });

  it('filters activation selectors to eligible physical products', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({ product: { count, findMany } }),
      ),
    };
    const repository = new ProductsRepository(prismaService as never);

    await repository.list({
      activationEligible: 'true',
      categoryId: 'film-category-id',
      limit: 10,
      page: 2,
      search: 'SP50',
    });

    const expectedEligibility = {
      deleted_at: null,
      status: product_status.ACTIVE,
      warranty: {
        is: {
          status: warranty_status.DRAFT,
          warranty_code: { not: '' },
        },
      },
      warranty_activation_request_items: {
        none: {
          status: {
            in: [
              warranty_activation_request_status.PENDING,
              warranty_activation_request_status.APPROVED,
            ],
          },
        },
      },
      warranty_activation_requests: {
        none: {
          status: {
            in: [
              warranty_activation_request_status.PENDING,
              warranty_activation_request_status.APPROVED,
            ],
          },
        },
      },
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ...expectedEligibility,
          AND: [{ category_id: 'film-category-id' }],
          OR: expect.any(Array),
        }),
        skip: 10,
        take: 10,
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining(expectedEligibility),
    });
  });

  it('filters claim selectors to products with currently active warranties and no open claims', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-27T08:00:00.000Z'));

    try {
      const findMany = jest.fn().mockResolvedValue([]);
      const count = jest.fn().mockResolvedValue(0);
      const prismaService = {
        $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
          callback({ product: { count, findMany } }),
        ),
      };
      const repository = new ProductsRepository(prismaService as never);
      const filters = {
        claimEligible: 'true',
        limit: 20,
        page: 1,
        search: 'WM-2026',
      };

      await repository.list(filters);

      const now = new Date('2026-08-27T08:00:00.000Z');
      const expectedEligibility = {
        deleted_at: null,
        status: product_status.ACTIVE,
        warranty: {
          is: {
            status: warranty_status.ACTIVE,
            warranty_code: { not: '' },
            AND: [
              { OR: [{ start_date: null }, { start_date: { lte: now } }] },
              { OR: [{ end_date: null }, { end_date: { gte: now } }] },
            ],
            claims: {
              none: {
                status: {
                  in: [
                    warranty_claim_status.SUBMITTED,
                    warranty_claim_status.REVIEWING,
                    warranty_claim_status.APPROVED,
                    warranty_claim_status.IN_REPAIR,
                  ],
                },
              },
            },
          },
        },
      };

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ...expectedEligibility,
            OR: expect.any(Array),
          }),
          skip: 0,
          take: 20,
        }),
      );
      expect(count).toHaveBeenCalledWith({
        where: expect.objectContaining(expectedEligibility),
      });
    } finally {
      jest.useRealTimers();
    }
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
          is_published: true,
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        is_published: true,
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

  it('paginates visible authoritative products', async () => {
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

    await repository.listPublic({
      categoryId: 'category-id',
      limit: 12,
      page: 1,
    });

    const visibilityFilter = {
      category_id: 'category-id',
      category_ref: { is_active: true },
      deleted_at: null,
      status: product_status.ACTIVE,
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

  it('paginates eligible activation options before disabled products', async () => {
    const eligibleProduct = { id: 'eligible-product' };
    const ineligibleProduct = { id: 'ineligible-product' };
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([eligibleProduct])
      .mockResolvedValueOnce([ineligibleProduct]);
    const count = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(4);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({
          activationCode: { groupBy: jest.fn().mockResolvedValue([]) },
          activationCodeBatch: { findMany: jest.fn().mockResolvedValue([]) },
          product: { count, findMany },
        }),
      ),
    };
    const repository = new ProductsRepository(prismaService as never);

    const result = await repository.listActivationOptions({
      categoryId: 'category-id',
      limit: 3,
      page: 1,
      search: 'film',
    });

    expect(result.items).toEqual([
      { ...eligibleProduct, activationCodeCounts: {} },
      { ...ineligibleProduct, activationCodeCounts: {} },
    ]);
    expect(result.meta).toEqual(
      expect.objectContaining({ limit: 3, page: 1, total: 4 }),
    );
    expect(findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        skip: 0,
        take: 2,
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ category_id: 'category-id' }),
          ]),
        }),
      }),
    );
    expect(findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        skip: 0,
        take: 1,
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ NOT: expect.any(Object) }),
          ]),
        }),
      }),
    );
  });
});
