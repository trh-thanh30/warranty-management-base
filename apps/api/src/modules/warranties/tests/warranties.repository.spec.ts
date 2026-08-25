import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';

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

  it('lists newest warranties first with a stable id tie-breaker', async () => {
    await repository.list({ limit: 10, page: 1 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
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
});
