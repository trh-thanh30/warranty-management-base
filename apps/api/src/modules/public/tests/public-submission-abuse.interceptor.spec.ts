import {
  PUBLIC_SUBMISSION_ACTION_KEY,
  PublicSubmissionAbuseInterceptor,
} from '@/modules/public/interceptors/public-submission-abuse.interceptor';
import { PublicSubmissionQuotaService } from '@/modules/public-submission-protection/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public-submission-protection/service/turnstile-verification.service';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';

describe('PublicSubmissionAbuseInterceptor', () => {
  it('reads parsed multipart claim fields before applying abuse protection', async () => {
    const assertWithinDailyQuota = jest.fn().mockResolvedValue(undefined);
    const verify = jest.fn().mockResolvedValue(undefined);
    const getAction = jest.fn().mockReturnValue('warranty-claim');
    const handle = jest.fn(() => of('created'));
    const quotaService = {
      assertWithinDailyQuota,
    } as unknown as PublicSubmissionQuotaService;
    const turnstileService = {
      verify,
    } as unknown as TurnstileVerificationService;
    const reflector = {
      get: getAction,
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
    const next = { handle } as CallHandler;
    const interceptor = new PublicSubmissionAbuseInterceptor(
      quotaService,
      turnstileService,
      reflector,
    );

    const result = await interceptor.intercept(context, next);

    expect(getAction).toHaveBeenCalledWith(
      PUBLIC_SUBMISSION_ACTION_KEY,
      handler,
    );
    expect(verify).toHaveBeenCalledWith({
      ip: '203.0.113.10',
      token: 'captcha-token',
    });
    expect(assertWithinDailyQuota).toHaveBeenCalledWith({
      action: 'warranty-claim',
      ip: '203.0.113.10',
      phone: '0901234567',
      referenceCode: 'wm-2026-abc123',
    });
    expect(handle).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });
});
