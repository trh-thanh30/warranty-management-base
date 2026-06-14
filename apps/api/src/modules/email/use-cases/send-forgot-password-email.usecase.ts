import { EmailService } from '@/modules/email/email.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

export interface SendForgotPasswordEmailParams {
  to: string;
  code: string;
  ttl: Date;
}

@Injectable()
export class SendForgotPasswordEmailUseCase implements BaseUseCase<
  SendForgotPasswordEmailParams,
  void
> {
  constructor(private readonly emailService: EmailService) {}

  async execute(params: SendForgotPasswordEmailParams): Promise<void> {
    const { to, code, ttl } = params;
    const idempotencyKey = `forgot-password:${to}:${code}`;
    await this.emailService.sendJob({
      to,
      template: 'forgot-password',
      context: {
        code,
        ttl: ttl.toISOString(),
        subject: 'Reset your password',
      },
      idempotencyKey,
    });
  }
}
