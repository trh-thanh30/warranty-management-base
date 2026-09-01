import { ExpireActivationCodesUseCase } from '@/modules/activation-codes/use-cases/expire-activation-codes.use-case';

describe('ExpireActivationCodesUseCase', () => {
  it('expires available codes in bounded batches until none remain', async () => {
    const now = new Date('2026-09-01T00:00:00.000Z');
    const repository = {
      findExpiredAvailableIds: jest
        .fn()
        .mockResolvedValueOnce(['code-1', 'code-2'])
        .mockResolvedValueOnce(['code-3'])
        .mockResolvedValueOnce([]),
      expireAvailableIds: jest
        .fn()
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValueOnce({ count: 1 }),
    };

    const result = await new ExpireActivationCodesUseCase(
      repository as never,
    ).execute({ batchSize: 2, now });

    expect(result).toEqual({ batches: 2, expired: 3 });
    expect(repository.findExpiredAvailableIds).toHaveBeenNthCalledWith(
      1,
      now,
      2,
    );
    expect(repository.expireAvailableIds).toHaveBeenNthCalledWith(
      1,
      ['code-1', 'code-2'],
      now,
    );
  });

  it('is a no-op when there are no expired available codes', async () => {
    const repository = {
      findExpiredAvailableIds: jest.fn().mockResolvedValue([]),
      expireAvailableIds: jest.fn(),
    };

    const result = await new ExpireActivationCodesUseCase(
      repository as never,
    ).execute({ batchSize: 100, now: new Date() });

    expect(result).toEqual({ batches: 0, expired: 0 });
    expect(repository.expireAvailableIds).not.toHaveBeenCalled();
  });
});
