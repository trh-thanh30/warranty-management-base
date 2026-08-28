import { EmailService } from '@/modules/email/email.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  template?: string;
  context?: Record<string, unknown>;
  warrantyCertificateId?: string;
  warrantyActivationRequestCertificateId?: string;
  attachments?: Array<{
    contentBase64: string;
    contentType: string;
    filename: string;
  }>;
}

@Injectable()
export class SendEmailUseCase implements BaseUseCase<SendEmailParams, void> {
  constructor(private readonly emailService: EmailService) {}

  async execute(params: SendEmailParams): Promise<void> {
    const {
      to,
      subject,
      text,
      html,
      attachments,
      context,
      template,
      warrantyCertificateId,
      warrantyActivationRequestCertificateId,
    } = params;
    const idempotencyKey = warrantyActivationRequestCertificateId
      ? `email:warranty-activation-request-certificate:${warrantyActivationRequestCertificateId}:${Date.now()}`
      : warrantyCertificateId
        ? `email:warranty-certificate:${warrantyCertificateId}:${Date.now()}`
        : `email:${to}:${subject}`;
    await this.emailService.sendJob({
      to,
      subject,
      text,
      html,
      template,
      context,
      warrantyCertificateId,
      warrantyActivationRequestCertificateId,
      attachments,
      idempotencyKey,
    });
  }
}
