import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';

describe('ServiceCentersRepository active filter', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const repository = new ServiceCentersRepository({
    $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
      callback({ serviceCenter: { count, findMany } }),
    ),
    serviceCenter: { findMany },
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
