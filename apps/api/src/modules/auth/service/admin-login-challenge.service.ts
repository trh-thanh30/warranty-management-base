import {
  BadRequestError,
  RateLimitError,
  UnauthorizedError,
} from '@/common/response';
import { RedisService } from '@/database/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

export type AdminLoginChallenge = {
  userId: string;
  email: string;
};

@Injectable()
export class AdminLoginChallengeService {
  static readonly TTL_SECONDS = 10 * 60;

  private readonly prefix = 'admin-login-2fa';

  constructor(private readonly redisService: RedisService) {}

  async create(data: AdminLoginChallenge): Promise<{
    challengeId: string;
    expiresAt: Date;
  }> {
    const redis = this.redisService.getClient();
    const challengeId = randomBytes(32).toString('hex');
    const activeKey = this.activeKey(data.userId);
    const previousChallengeId = await redis.get(activeKey);
    const transaction = redis.multi();

    if (previousChallengeId) {
      transaction.del(this.challengeKey(previousChallengeId));
    }
    transaction.set(
      this.challengeKey(challengeId),
      JSON.stringify(data),
      'EX',
      AdminLoginChallengeService.TTL_SECONDS,
    );
    transaction.set(
      activeKey,
      challengeId,
      'EX',
      AdminLoginChallengeService.TTL_SECONDS,
    );
    await transaction.exec();

    return {
      challengeId,
      expiresAt: new Date(
        Date.now() + AdminLoginChallengeService.TTL_SECONDS * 1000,
      ),
    };
  }

  async acquireSendSlot(userId: string): Promise<void> {
    const acquired = await this.redisService
      .getClient()
      .set(`${this.prefix}:send-cooldown:${userId}`, '1', 'EX', 60, 'NX');
    if (!acquired) {
      throw new RateLimitError(
        'Please wait before requesting another verification code.',
      );
    }
  }

  async releaseSendSlot(userId: string): Promise<void> {
    await this.redisService.del(`${this.prefix}:send-cooldown:${userId}`);
  }

  async get(challengeId: string): Promise<AdminLoginChallenge> {
    const raw = await this.redisService.get(this.challengeKey(challengeId));
    if (!raw) {
      throw new UnauthorizedError('Invalid or expired login challenge');
    }

    try {
      return JSON.parse(raw) as AdminLoginChallenge;
    } catch {
      await this.redisService.del(this.challengeKey(challengeId));
      throw new UnauthorizedError('Invalid or expired login challenge');
    }
  }

  async delete(challengeId: string): Promise<void> {
    const challenge = await this.getOptional(challengeId);
    const redis = this.redisService.getClient();
    const transaction = redis.multi().del(this.challengeKey(challengeId));

    if (challenge) {
      const activeKey = this.activeKey(challenge.userId);
      if ((await redis.get(activeKey)) === challengeId) {
        transaction.del(activeKey);
      }
    }
    await transaction.exec();
  }

  async withLock<T>(
    challengeId: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    const redis = this.redisService.getClient();
    const lockKey = `${this.challengeKey(challengeId)}:lock`;
    const lockValue = randomBytes(16).toString('hex');
    const acquired = await redis.set(lockKey, lockValue, 'EX', 10, 'NX');

    if (!acquired) {
      throw new BadRequestError('Verification is already in progress');
    }

    try {
      return await callback();
    } finally {
      await redis.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0",
        1,
        lockKey,
        lockValue,
      );
    }
  }

  private async getOptional(
    challengeId: string,
  ): Promise<AdminLoginChallenge | null> {
    const raw = await this.redisService.get(this.challengeKey(challengeId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminLoginChallenge;
    } catch {
      return null;
    }
  }

  private challengeKey(challengeId: string): string {
    return `${this.prefix}:challenge:${challengeId}`;
  }

  private activeKey(userId: string): string {
    return `${this.prefix}:user:${userId}`;
  }
}
