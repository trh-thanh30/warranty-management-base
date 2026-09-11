import { PublicSubmissionAbuseGuard } from '@/modules/public/guards/public-submission-abuse.guard';
import { PublicSubmissionQuotaService } from '@/modules/public/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public/service/turnstile-verification.service';
import type { ExecutionContext } from '@nestjs/common';

describe('PublicSubmissionAbuseGuard', () => {
  it('verifies Turnstile and applies phone, IP and activation-code quotas', async () => {
    const quotaService = {
      assertWithinDailyQuota: jest.fn().mockResolvedValue(undefined),
    } as unknown as PublicSubmissionQuotaService;
    const turnstileService = {
      verify: jest.fn().mockResolvedValue(undefined),
    } as unknown as TurnstileVerificationService;
    const request = {
      body: {
        activationCode: 'sp-abc123',
        customerPhone: '0901234567',
      },
      headers: { 'x-turnstile-token': 'captcha-token' },
      ip: '203.0.113.10',
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    const guard = new PublicSubmissionAbuseGuard(
      quotaService,
      turnstileService,
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(turnstileService.verify).toHaveBeenCalledWith({
      ip: '203.0.113.10',
      token: 'captcha-token',
    });
    expect(quotaService.assertWithinDailyQuota).toHaveBeenCalledWith({
      action: 'activation-request',
      ip: '203.0.113.10',
      phone: '0901234567',
      referenceCode: 'sp-abc123',
    });
  });
});
