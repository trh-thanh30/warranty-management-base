import { ListAvailableActivationCodesUseCase } from '@/modules/activation-codes/use-cases/list-available-activation-codes.use-case';

describe('ListAvailableActivationCodesUseCase', () => {
  it('forwards the selected batch filter to the repository', async () => {
    const result = { items: [], meta: { page: 1, total: 0 } };
    const repository = {
      listAvailableByProduct: jest.fn().mockResolvedValue(result),
    };
    const filters = {
      assignment: 'UNASSIGNED' as const,
      batchId: 'c6058d8c-5139-4f13-b696-d79b5f99f746',
      limit: 20,
      page: 1,
    };

    await expect(
      new ListAvailableActivationCodesUseCase(repository as never).execute(
        undefined,
        filters,
      ),
    ).resolves.toBe(result);
    expect(repository.listAvailableByProduct).toHaveBeenCalledWith(
      undefined,
      filters,
    );
  });
});
