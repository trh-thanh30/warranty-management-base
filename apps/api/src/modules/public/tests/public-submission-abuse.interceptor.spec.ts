import {
  PUBLIC_SUBMISSION_ACTION_KEY,
  PublicSubmissionAbuseInterceptor,
} from '@/modules/public/interceptors/public-submission-abuse.interceptor';
import { PublicSubmissionQuotaService } from '@/modules/public/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public/service/turnstile-verification.service';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';

describe('PublicSubmissionAbuseInterceptor', () => {
  it('reads parsed multipart claim fields before applying abuse protection', async () => {
    const quotaService = {
      assertWithinDailyQuota: jest.fn().mockResolvedValue(undefined),
    } as unknown as PublicSubmissionQuotaService;
    const turnstileService = {
      verify: jest.fn().mockResolvedValue(undefined),
    } as unknown as TurnstileVerificationService;
    const reflector = {
      get: jest.fn().mockReturnValue('warranty-claim'),
    } as unknown as Reflector;
    const request = {
      body: {
        requesterPhone: '0901234567',
        warrantyCode: 'wm-2026-abc123',
      },
      headers: { 'x-turnstile-token': 'captcha-token' },
      ip: '203.0.113.10',
      socket: {},
    };
    const response = { setHeader: jest.fn() };
    const handler = jest.fn();
    const context = {
      getHandler: () => handler,
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    const next = { handle: jest.fn(() => of('created')) } as CallHandler;
    const interceptor = new PublicSubmissionAbuseInterceptor(
      quotaService,
      turnstileService,
      reflector,
    );

    const result = await interceptor.intercept(context, next);

    expect(reflector.get).toHaveBeenCalledWith(
      PUBLIC_SUBMISSION_ACTION_KEY,
      handler,
    );
    expect(turnstileService.verify).toHaveBeenCalledWith({
      ip: '203.0.113.10',
      token: 'captcha-token',
    });
    expect(quotaService.assertWithinDailyQuota).toHaveBeenCalledWith({
      action: 'warranty-claim',
      ip: '203.0.113.10',
      phone: '0901234567',
      referenceCode: 'wm-2026-abc123',
    });
    expect(next.handle).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });
});
