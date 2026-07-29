import { RedisService } from '@/database/redis/redis.service';
import vietnamProvincesConfig from '@/config/vietnam-provinces.config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

@Injectable()
export class LocationsCacheService {
  private readonly logger = new Logger(LocationsCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    @Inject(vietnamProvincesConfig.KEY)
    private readonly provincesCfg: ConfigType<typeof vietnamProvincesConfig>,
  ) {}

  async remember<T>(
    key: string,
    load: () => Promise<T>,
    ttlSeconds = this.provincesCfg.cacheTtlSeconds,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await load();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  private async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redisService.get(key);
      if (!cached) return null;
      const parsed: unknown = JSON.parse(cached);
      return parsed as T;
    } catch (error) {
      this.logger.warn(`Location cache read failed: ${this.message(error)}`);
      return null;
    }
  }

  private async set<T>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      await this.redisService.set(key, JSON.stringify(value), ttlSeconds);
    } catch (error) {
      this.logger.warn(`Location cache write failed: ${this.message(error)}`);
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
