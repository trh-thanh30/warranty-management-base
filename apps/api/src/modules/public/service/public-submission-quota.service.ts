import { RateLimitError } from '@/common/response/client-errors';
import publicAbuseConfig, {
  type PublicAbuseConfig,
} from '@/config/public-abuse.config';
import { RedisService } from '@/database/redis/redis.service';
import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

const INCREMENT_DAILY_QUOTAS_SCRIPT = `
local exceeded_scope = 0
local longest_retry = 0

for index, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, ARGV[1])
  end

  if count > tonumber(ARGV[index + 1]) and exceeded_scope == 0 then
    exceeded_scope = index
    longest_retry = redis.call('PTTL', key)
  end
end

if exceeded_scope > 0 then
  return {0, longest_retry, exceeded_scope}
end

return {1, 0, 0}
`;

const QUOTA_SCOPES = ['ip', 'phone', 'code'] as const;

type PublicSubmissionIdentity = {
  action: 'activation-request' | 'warranty-claim';
  ip: string;
  phone: string;
  referenceCode: string;
};

@Injectable()
export class PublicSubmissionQuotaService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(publicAbuseConfig.KEY)
    private readonly config: PublicAbuseConfig,
  ) {}

  async assertWithinDailyQuota(
    identity: PublicSubmissionIdentity,
  ): Promise<void> {
    const prefix = `public-submission:${identity.action}`;
    const keys = [
      `${prefix}:ip:${hashIdentity(identity.ip)}`,
      `${prefix}:phone:${hashIdentity(normalize(identity.phone))}`,
      `${prefix}:code:${hashIdentity(normalize(identity.referenceCode))}`,
    ];
    const result = (await this.redisService
      .getClient()
      .eval(
        INCREMENT_DAILY_QUOTAS_SCRIPT,
        keys.length,
        ...keys,
        this.config.dailyWindowSeconds,
        this.config.dailyIpLimit,
        this.config.dailyPhoneLimit,
        this.config.dailyCodeLimit,
      )) as [number, number, number];

    if (Number(result[0]) === 1) return;

    const scope = QUOTA_SCOPES[Number(result[2]) - 1] ?? 'ip';
    const retryAfterSeconds = Math.max(1, Math.ceil(Number(result[1]) / 1000));

    throw new RateLimitError(
      'Daily public submission quota exceeded',
      'PUBLIC_DAILY_QUOTA_EXCEEDED',
      { retryAfterSeconds, scope },
    );
  }
}

function hashIdentity(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalize(value: string): string {
  return value.trim().toUpperCase();
}
