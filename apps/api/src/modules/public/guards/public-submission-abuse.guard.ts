import { RateLimitError } from '@/common/response/client-errors';
import { PublicSubmissionQuotaService } from '@/modules/public/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public/service/turnstile-verification.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class PublicSubmissionAbuseGuard implements CanActivate {
  constructor(
    private readonly quotaService: PublicSubmissionQuotaService,
    private readonly turnstileService: TurnstileVerificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const body = request.body as Record<string, unknown>;
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const token = getHeader(request.headers['x-turnstile-token']);
    const isActivationRequest = typeof body.activationCode === 'string';

    await this.turnstileService.verify({ ip, token });

    try {
      await this.quotaService.assertWithinDailyQuota({
        action: isActivationRequest ? 'activation-request' : 'warranty-claim',
        ip,
        phone: getString(
          isActivationRequest ? body.customerPhone : body.requesterPhone,
        ),
        referenceCode: getString(
          isActivationRequest ? body.activationCode : body.warrantyCode,
        ),
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        const retryAfterSeconds = Number(error.details?.retryAfterSeconds);
        if (Number.isFinite(retryAfterSeconds)) {
          http
            .getResponse<Response>()
            .setHeader('Retry-After', Math.ceil(retryAfterSeconds));
        }
      }
      throw error;
    }

    return true;
  }
}

function getHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
