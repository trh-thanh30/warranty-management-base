import { PresenceRepository } from '@/modules/analytics/repository/presence.repository';

describe('PresenceRepository', () => {
  const evaluate = jest.fn();
  const repository = new PresenceRepository({
    getClient: () => ({ eval: evaluate }),
  });

  beforeEach(() => jest.resetAllMocks());

  it('atomically refreshes a Web member and expires the set after two minutes', async () => {
    await repository.heartbeat('web', 'browser-id');
    expect(evaluate).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('ZADD', KEYS[1], now, ARGV[1])"),
      1,
      'presence:web',
      'browser-id',
      120,
    );
    for (const operation of ['TIME', 'ZREMRANGEBYSCORE', 'EXPIRE']) {
      expect(evaluate).toHaveBeenCalledWith(
        expect.stringContaining(`redis.call('${operation}'`),
        1,
        'presence:web',
        'browser-id',
        120,
      );
    }
  });

  it('stores Admin accounts in a separate set', async () => {
    await repository.heartbeat('admin', 'user-id');
    expect(evaluate).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'presence:admin',
      'user-id',
      120,
    );
  });

  it('prunes expired members before returning both counters, including zero', async () => {
    evaluate.mockResolvedValueOnce([0, 2]);
    await expect(repository.getOnlineCounts()).resolves.toEqual({
      web: 0,
      admin: 2,
      windowSeconds: 120,
    });
    expect(evaluate).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('ZREMRANGEBYSCORE'"),
      2,
      'presence:web',
      'presence:admin',
      120,
    );
  });

  it.each([null, [1], [-1, 2], [1.5, 2], ['1', 2]])(
    'rejects invalid Redis results: %p',
    async (result) => {
      evaluate.mockResolvedValueOnce(result);
      await expect(repository.getOnlineCounts()).rejects.toThrow(
        'Invalid online presence counts',
      );
    },
  );
});
