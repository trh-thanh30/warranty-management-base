import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { product_status, warranty_status } from '@prisma/client';
import { WARRANTY_CLAIM_OPEN_STATUSES } from '@repo/shared/constants';

describe('WarrantiesRepository sorting', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);

  const repository = new WarrantiesRepository({
    $transaction: jest.fn(
      (
        callback: (transaction: {
          warranty: {
            count: typeof count;
            findMany: typeof findMany;
          };
        }) => unknown,
      ) => callback({ warranty: { count, findMany } }),
    ),
    warranty: { findMany },
  } as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('filters claim options from every eligible warranty record', async () => {
    const now = new Date('2026-09-11T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    await repository.list({
      categoryId: 'category-id',
      claimEligible: 'true',
      limit: 20,
      page: 1,
      productId: 'product-id',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: [
            { OR: [{ start_date: null }, { start_date: { lte: now } }] },
            { OR: [{ end_date: null }, { end_date: { gte: now } }] },
          ],
          claims: {
            none: { status: { in: [...WARRANTY_CLAIM_OPEN_STATUSES] } },
          },
          ownerships: { some: { is_current_owner: true } },
          product: {
            category_id: 'category-id',
            deleted_at: null,
            status: product_status.ACTIVE,
          },
          product_id: 'product-id',
          status: warranty_status.ACTIVE,
          warranty_code: { not: '' },
        }),
      }),
    );
  });

  it('includes warranties with an open claim when explicitly requested', async () => {
    await repository.list({
      claimEligible: 'true',
      includeOpenClaim: 'true',
      search: 'WM-2026-ABC123',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          claims: undefined,
          status: warranty_status.ACTIVE,
        }),
      }),
    );
  });

  it('lists newest warranties first with a stable id tie-breaker', async () => {
    await repository.list({ limit: 10, page: 1 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        where: expect.objectContaining({ status: warranty_status.ACTIVE }),
      }),
    );
  });

  it('does not filter warranty status when status is all', async () => {
    await repository.list({ limit: 10, page: 1, status: 'ALL' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: undefined }),
      }),
    );
  });

  it('keeps custom sorting stable by using creation date and id tie-breakers', async () => {
    await repository.list({
      limit: 10,
      page: 1,
      sortBy: 'startDate',
      sortOrder: 'asc',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { start_date: 'asc' },
          { created_at: 'desc' },
          { id: 'desc' },
        ],
      }),
    );
  });

  it('exports warranties in the same deterministic order as the list', async () => {
    await repository.listForExport({
      sortBy: 'endDate',
      sortOrder: 'desc',
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ end_date: 'desc' }, { created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('uses the same default and all status semantics for exports', async () => {
    await repository.listForExport({});
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: warranty_status.ACTIVE }),
      }),
    );

    await repository.listForExport({ status: 'ALL' });
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: undefined }),
      }),
    );
  });
});
