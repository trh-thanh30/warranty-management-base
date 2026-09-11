import { RedisService } from '@/database/redis/redis.service';
import { RedisThrottlerStorage } from '@/common/throttling/redis-throttler-storage.service';

describe('RedisThrottlerStorage', () => {
  it('returns the shared Redis rate-limit state', async () => {
    const evalCommand = jest.fn().mockResolvedValue([6, 42_000, 1, 300_000]);
    const redisService = {
      getClient: () => ({ eval: evalCommand }),
    } as unknown as RedisService;
    const storage = new RedisThrottlerStorage(redisService);

    await expect(
      storage.increment('request-key', 60_000, 5, 300_000, 'default'),
    ).resolves.toEqual({
      isBlocked: true,
      timeToBlockExpire: 300,
      timeToExpire: 42,
      totalHits: 6,
    });

    expect(evalCommand).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'throttler:default:request-key',
      'throttler:default:request-key:block',
      60_000,
      5,
      300_000,
    );
  });
});
