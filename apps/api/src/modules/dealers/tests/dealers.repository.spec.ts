import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';

describe('DealersRepository active filter', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const repository = new DealersRepository({
    $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
      callback({ dealer: { count, findMany } }),
    ),
    dealer: { findMany },
  } as never);

  beforeEach(() => jest.clearAllMocks());

  it.each([
    [undefined, true],
    ['all', undefined],
  ] as const)('maps list isActive=%s to %s', async (isActive, expected) => {
    await repository.list({ isActive, limit: 10, page: 1 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ is_active: expected }),
      }),
    );
  });

  it.each([
    [undefined, true],
    ['all', undefined],
  ] as const)('maps export isActive=%s to %s', async (isActive, expected) => {
    await repository.listForExport({ isActive });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ is_active: expected }),
      }),
    );
  });
});
