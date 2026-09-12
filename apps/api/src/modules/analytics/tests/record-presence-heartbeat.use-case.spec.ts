import { RecordPresenceHeartbeatUseCase } from '@/modules/analytics/use-cases/record-presence-heartbeat.use-case';

describe('RecordPresenceHeartbeatUseCase', () => {
  const repository = { heartbeat: jest.fn() };
  const useCase = new RecordPresenceHeartbeatUseCase(repository);

  beforeEach(() => jest.resetAllMocks());

  it('records a browser identity for Web', async () => {
    await expect(useCase.execute('web', 'browser-id')).resolves.toEqual({
      recorded: true,
    });
    expect(repository.heartbeat).toHaveBeenCalledWith('web', 'browser-id');
  });

  it('records the signed-in account identity for Admin', async () => {
    await useCase.execute('admin', 'user-id');
    expect(repository.heartbeat).toHaveBeenCalledWith('admin', 'user-id');
  });

  it('does not pretend a heartbeat was recorded when Redis is unavailable', async () => {
    repository.heartbeat.mockRejectedValueOnce(new Error('Redis unavailable'));
    await expect(useCase.execute('web', 'browser-id')).rejects.toThrow(
      'Redis unavailable',
    );
  });
});
