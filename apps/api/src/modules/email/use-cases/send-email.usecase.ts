import { EmailService } from '@/modules/email/email.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class SendEmailUseCase implements BaseUseCase<SendEmailParams, void> {
  constructor(private readonly emailService: EmailService) {}

  async execute(params: SendEmailParams): Promise<void> {
    const { to, subject, text, html } = params;
    const idempotencyKey = `email:${to}:${subject}`;
    await this.emailService.sendJob({
      to,
      subject,
      text,
      html,
      idempotencyKey,
    });
  }
}
