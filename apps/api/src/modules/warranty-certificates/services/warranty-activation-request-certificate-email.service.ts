import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import EmailConfig from '@/config/email.config';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { warranty_certificate_email_status } from '@prisma/client';

@Injectable()
export class WarrantyActivationRequestCertificateEmailService {
  private readonly logger = new Logger(
    WarrantyActivationRequestCertificateEmailService.name,
  );

  constructor(
    private readonly repository: WarrantyActivationRequestCertificatesRepository,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly uploadAssetService: UploadAssetService,
    @Inject(EmailConfig.KEY)
    private readonly emailConfig: ConfigType<typeof EmailConfig>,
  ) {}

  async queueEmail(certificateId: string) {
    const certificate = await this.repository.findEmailDataById(certificateId);
    if (!certificate) throw new Error('Request certificate not found');
    if (!certificate.recipient_email) {
      throw new Error('Request certificate recipient email is required');
    }
    if (!certificate.storage_key) {
      throw new Error('Request certificate PDF is unavailable');
    }

    try {
      const stream = await this.uploadAssetService.getStream(
        certificate.storage_key,
      );
      const pdf = await streamToBuffer(stream);
      const items = certificate.activation_request.items;
      const subject = `Chứng nhận bảo hành điện tử ${certificate.certificate_number}`;
      const text = [
        `Xin chào ${certificate.activation_request.customer_name},`,
        '',
        'Các sản phẩm trong yêu cầu đã được kích hoạt bảo hành:',
        ...items.map(
          (item) =>
            `- ${item.position_label}: ${item.product_name} | ${item.serial_number ?? '-'} | ${item.warranty_code}`,
        ),
        '',
        'Chứng nhận bảo hành được đính kèm trong email này.',
      ].join('\n');

      await this.sendEmailUseCase.execute({
        attachments: [
          {
            contentBase64: pdf.toString('base64'),
            contentType: 'application/pdf',
            filename: `${certificate.certificate_number}.pdf`,
          },
        ],
        context: {
          brandLogoUrl: this.emailConfig.brandLogoUrl,
          certificateCount: items.length,
          certificateNumber: certificate.certificate_number,
          certificates: items.map((item) => ({
            positionLabel: item.position_label,
            productName: item.product_name,
            warrantyCode: item.warranty_code,
          })),
          customerName: certificate.activation_request.customer_name,
          subject,
        },
        subject,
        template: 'warranty-certificates',
        text,
        to: certificate.recipient_email,
        warrantyActivationRequestCertificateId: certificate.id,
      });

      return this.repository.update(certificate.id, {
        email_status: warranty_certificate_email_status.QUEUED,
        emailed_at: new Date(),
        last_error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue request certificate email ${certificate.id}: ${message}`,
      );
      await this.repository.update(certificate.id, {
        email_status: warranty_certificate_email_status.FAILED,
        last_error: message,
      });
      throw error;
    }
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
