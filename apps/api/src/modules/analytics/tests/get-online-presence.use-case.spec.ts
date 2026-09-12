import { GetOnlinePresenceUseCase } from '@/modules/analytics/use-cases/get-online-presence.use-case';

describe('GetOnlinePresenceUseCase', () => {
  it('returns separate Web and Admin counts with the active window', async () => {
    const summary = { web: 10, admin: 2, windowSeconds: 120 };
    const repository = {
      getOnlineCounts: jest.fn().mockResolvedValue(summary),
    };
    const useCase = new GetOnlinePresenceUseCase(repository);
    await expect(useCase.execute()).resolves.toEqual(summary);
    expect(repository.getOnlineCounts).toHaveBeenCalledTimes(1);
  });
});
