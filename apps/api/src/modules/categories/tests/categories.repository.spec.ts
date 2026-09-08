import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';

describe('CategoriesRepository active filter', () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const count = jest.fn().mockResolvedValue(0);
  const countActivationCodes = jest.fn().mockResolvedValue(2);
  const repository = new CategoriesRepository({
    $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
      callback({ category: { count, findMany } }),
    ),
    activationCode: { count: countActivationCodes },
    category: { findMany },
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

  it('counts activation codes assigned to products in a category', async () => {
    await expect(
      repository.countAssignedActivationCodes('category-1'),
    ).resolves.toBe(2);

    expect(countActivationCodes).toHaveBeenCalledWith({
      where: { product: { is: { category_id: 'category-1' } } },
    });
  });
});
