import { Module } from '@nestjs/common';
import { RedisThrottlerStorage } from '@/common/throttling/redis-throttler-storage.service';
import { RedisService } from '@/database/redis/redis.service';

@Module({
  providers: [RedisService, RedisThrottlerStorage],
  exports: [RedisService, RedisThrottlerStorage],
})
export class RedisModule {}
