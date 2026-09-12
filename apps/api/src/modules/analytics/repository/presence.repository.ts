import { RedisService } from '@/database/redis/redis.service';
import {
  PRESENCE_KEYS,
  PRESENCE_WINDOW_SECONDS,
} from '@/modules/analytics/presence.constants';
import { Inject, Injectable } from '@nestjs/common';
import type { OnlinePresenceSummary } from '@repo/shared';
import type Redis from 'ioredis';

// Redis time and atomic scripts keep expiry consistent across API instances.
const HEARTBEAT_SCRIPT = `
local now = tonumber(redis.call('TIME')[1])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - tonumber(ARGV[2]))
redis.call('ZADD', KEYS[1], now, ARGV[1])
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
return 1
`;

const COUNT_SCRIPT = `
local now = tonumber(redis.call('TIME')[1])
local counts = {}
for i, key in ipairs(KEYS) do
  redis.call('ZREMRANGEBYSCORE', key, '-inf', now - tonumber(ARGV[1]))
  counts[i] = redis.call('ZCARD', key)
end
return counts
`;

@Injectable()
export class PresenceRepository {
  constructor(
    @Inject(RedisService)
    private readonly redis: { getClient: () => Pick<Redis, 'eval'> },
  ) {}

  async heartbeat(source: keyof typeof PRESENCE_KEYS, identity: string) {
    await this.redis
      .getClient()
      .eval(
        HEARTBEAT_SCRIPT,
        1,
        PRESENCE_KEYS[source],
        identity,
        PRESENCE_WINDOW_SECONDS,
      );
  }

  async getOnlineCounts(): Promise<OnlinePresenceSummary> {
    const counts = await this.redis
      .getClient()
      .eval(
        COUNT_SCRIPT,
        2,
        PRESENCE_KEYS.web,
        PRESENCE_KEYS.admin,
        PRESENCE_WINDOW_SECONDS,
      );
    if (
      !Array.isArray(counts) ||
      counts.length !== 2 ||
      !counts.every(
        (count: unknown) =>
          typeof count === 'number' && Number.isInteger(count) && count >= 0,
      )
    ) {
      throw new Error('Invalid online presence counts from Redis');
    }

    return {
      web: Number(counts[0]),
      admin: Number(counts[1]),
      windowSeconds: PRESENCE_WINDOW_SECONDS,
    };
  }
}
