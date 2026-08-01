import { EmailService } from '@/modules/email/email.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

export interface SendAdminLoginCodeEmailParams {
  to: string;
  code: string;
  ttl: number;
}

@Injectable()
export class SendAdminLoginCodeEmailUseCase implements BaseUseCase<
  SendAdminLoginCodeEmailParams,
  void
> {
  constructor(private readonly emailService: EmailService) {}

  async execute(params: SendAdminLoginCodeEmailParams): Promise<void> {
    await this.emailService.sendJob({
      to: params.to,
      template: 'admin-login-code',
      context: {
        code: params.code,
        ttl: Math.max(1, Math.ceil(params.ttl / 60_000)),
        subject: 'Your admin login verification code',
      },
      idempotencyKey: `admin-login-code:${params.to}:${params.code}`,
    });
  }
}
