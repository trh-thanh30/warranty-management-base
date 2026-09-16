import { TurnstileVerificationService } from '@/modules/public-submission-protection/service/turnstile-verification.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ContactSubmissionTurnstileGuard implements CanActivate {
  constructor(
    private readonly turnstileVerificationService: TurnstileVerificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-turnstile-token'];
    const ip = request.ip || request.socket.remoteAddress || 'unknown';

    await this.turnstileVerificationService.verify({
      ip,
      token: Array.isArray(token) ? token[0] : token,
    });

    return true;
  }
}
