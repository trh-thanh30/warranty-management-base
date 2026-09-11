import { RedisService } from '@/database/redis/redis.service';
import { Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';

type ThrottlerStorageResult = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

const INCREMENT_RATE_LIMIT_SCRIPT = `
local blocked_ttl = redis.call('PTTL', KEYS[2])
if blocked_ttl > 0 then
  local blocked_hits = tonumber(redis.call('GET', KEYS[1])) or (tonumber(ARGV[2]) + 1)
  local window_ttl = redis.call('PTTL', KEYS[1])
  return {blocked_hits, window_ttl, 1, blocked_ttl}
end

local hits = redis.call('INCR', KEYS[1])
if hits == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end

local window_ttl = redis.call('PTTL', KEYS[1])
if hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  return {hits, window_ttl, 1, tonumber(ARGV[3])}
end

return {hits, window_ttl, 0, 0}
`;

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageResult> {
    const redisKey = `throttler:${throttlerName}:${key}`;
    const result = (await this.redisService
      .getClient()
      .eval(
        INCREMENT_RATE_LIMIT_SCRIPT,
        2,
        redisKey,
        `${redisKey}:block`,
        ttl,
        limit,
        blockDuration,
      )) as [number, number, number, number];

    return {
      totalHits: Number(result[0]),
      timeToExpire: millisecondsToSeconds(result[1]),
      isBlocked: Number(result[2]) === 1,
      timeToBlockExpire: millisecondsToSeconds(result[3]),
    };
  }
}

function millisecondsToSeconds(milliseconds: number): number {
  return Math.max(0, Math.ceil(Number(milliseconds) / 1000));
}
