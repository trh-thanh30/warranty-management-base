import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import EmailConfig from '@/config/email.config';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WARRANTY_CERTIFICATE_EMAIL_STATUS } from '@/modules/warranty-certificates/warranty-certificates.types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

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
    if (!certificate.recipientEmail) {
      throw new Error('Request certificate recipient email is required');
    }
    if (!certificate.storageKey) {
      throw new Error('Request certificate PDF is unavailable');
    }

    try {
      const stream = await this.uploadAssetService.getStream(
        certificate.storageKey,
      );
      const pdf = await streamToBuffer(stream);
      const items = certificate.request.items;
      const subject = `Chứng nhận bảo hành điện tử ${certificate.certificateNumber}`;
      const text = [
        `Xin chào ${certificate.request.customerName},`,
        '',
        'Các sản phẩm trong yêu cầu đã được kích hoạt bảo hành:',
        ...items.map(
          (item) =>
            `- ${item.positionLabel}: ${item.productName} | ${item.serialNumber ?? '-'} | ${item.warrantyCode}`,
        ),
        '',
        'Chứng nhận bảo hành được đính kèm trong email này.',
      ].join('\n');

      await this.sendEmailUseCase.execute({
        attachments: [
          {
            contentBase64: pdf.toString('base64'),
            contentType: 'application/pdf',
            filename: `${certificate.certificateNumber}.pdf`,
          },
        ],
        context: {
          brandLogoUrl: this.emailConfig.brandLogoUrl,
          certificateCount: items.length,
          certificateNumber: certificate.certificateNumber,
          certificates: items.map((item) => ({
            positionLabel: item.positionLabel,
            productName: item.productName,
            warrantyCode: item.warrantyCode,
          })),
          customerName: certificate.request.customerName,
          subject,
        },
        subject,
        template: 'warranty-certificates',
        text,
        to: certificate.recipientEmail,
        warrantyActivationRequestCertificateId: certificate.id,
      });

      return this.repository.update(certificate.id, {
        emailStatus: WARRANTY_CERTIFICATE_EMAIL_STATUS.QUEUED,
        emailedAt: new Date(),
        lastError: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue request certificate email ${certificate.id}: ${message}`,
      );
      await this.repository.update(certificate.id, {
        emailStatus: WARRANTY_CERTIFICATE_EMAIL_STATUS.FAILED,
        lastError: message,
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
