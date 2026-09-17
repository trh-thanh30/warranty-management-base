import { RateLimitError } from '@/common/response/client-errors';
import { RedisService } from '@/database/redis/redis.service';
import { PublicSubmissionQuotaService } from '@/modules/public-submission-protection/service/public-submission-quota.service';

describe('PublicSubmissionQuotaService', () => {
  it('rejects a submission when any daily identity quota is exceeded', async () => {
    const evalCommand = jest.fn().mockResolvedValue([0, 7_200_000, 2]);
    const redisService = {
      getClient: () => ({ eval: evalCommand }),
    } as unknown as RedisService;
    const service = new PublicSubmissionQuotaService(redisService, {
      dailyCodeLimit: 3,
      dailyIpLimit: 20,
      dailyPhoneLimit: 5,
      dailyWindowSeconds: 86_400,
    });

    const promise = service.assertWithinDailyQuota({
      action: 'activation-request',
      ip: '203.0.113.10',
      phone: '0901234567',
      referenceCode: 'SP-ABC123',
    });

    await expect(promise).rejects.toMatchObject<Partial<RateLimitError>>({
      code: 'PUBLIC_DAILY_QUOTA_EXCEEDED',
      details: {
        retryAfterSeconds: 7200,
        scope: 'phone',
      },
      statusCode: 429,
    });
    expect(JSON.stringify(evalCommand.mock.calls)).not.toContain('0901234567');
    expect(JSON.stringify(evalCommand.mock.calls)).not.toContain('SP-ABC123');
  });
});
