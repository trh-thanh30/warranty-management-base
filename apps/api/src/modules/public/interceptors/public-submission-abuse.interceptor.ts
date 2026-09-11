import { RateLimitError } from '@/common/response/client-errors';
import { PublicSubmissionQuotaService } from '@/modules/public/service/public-submission-quota.service';
import { TurnstileVerificationService } from '@/modules/public/service/turnstile-verification.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';

export const PUBLIC_SUBMISSION_ACTION_KEY = 'publicSubmissionAction';

type PublicSubmissionAction = 'activation-request' | 'warranty-claim';

export const PublicSubmissionAction = (action: PublicSubmissionAction) =>
  SetMetadata(PUBLIC_SUBMISSION_ACTION_KEY, action);

@Injectable()
export class PublicSubmissionAbuseInterceptor implements NestInterceptor {
  constructor(
    private readonly quotaService: PublicSubmissionQuotaService,
    private readonly turnstileService: TurnstileVerificationService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const action = this.reflector.get<PublicSubmissionAction>(
      PUBLIC_SUBMISSION_ACTION_KEY,
      context.getHandler(),
    );
    if (!action) return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const body = (request.body ?? {}) as Record<string, unknown>;
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const token = getHeader(request.headers['x-turnstile-token']);
    const isActivationRequest = action === 'activation-request';

    await this.turnstileService.verify({ ip, token });

    try {
      await this.quotaService.assertWithinDailyQuota({
        action,
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

    return next.handle();
  }
}

function getHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
