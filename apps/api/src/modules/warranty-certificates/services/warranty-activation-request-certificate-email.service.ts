import EmailConfig from '@/config/email.config';
import ClientConfig from '@/config/client.config';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import {
  WARRANTY_CERTIFICATE_EMAIL_STATUS,
  WARRANTY_CERTIFICATE_STATUS,
} from '@/modules/warranty-certificates/types/warranty-certificates.types';
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
    @Inject(ClientConfig.KEY)
    private readonly clientConfig: ConfigType<typeof ClientConfig>,
  ) {}

  async queueEmail(certificateId: string, options: { force?: boolean } = {}) {
    const certificate = await this.repository.findEmailDataById(certificateId);
    if (!certificate) throw new Error('Request certificate not found');
    if (
      !options.force &&
      (certificate.emailStatus === 'QUEUED' ||
        certificate.emailStatus === 'SENT')
    ) {
      return this.repository.findByRequestId(certificate.activationRequestId);
    }
    if (!certificate.recipientEmail) {
      throw new Error('Request certificate recipient email is required');
    }
    const withoutPdf =
      certificate.status === WARRANTY_CERTIFICATE_STATUS.FAILED;
    if (!withoutPdf && !certificate.storageKey) {
      throw new Error('Request certificate PDF is unavailable');
    }

    try {
      const pdf =
        !withoutPdf && certificate.storageKey
          ? await streamToBuffer(
              await this.uploadAssetService.getStream(certificate.storageKey),
            )
          : null;
      const items = certificate.request.items;
      const subject = withoutPdf
        ? 'Xác nhận kích hoạt bảo hành thành công'
        : `Chứng nhận bảo hành điện tử ${certificate.certificateNumber}`;
      const lookupUrl = this.clientConfig.warrantyLookupUrl;
      if (!lookupUrl) {
        throw new Error(
          'CLIENT_WARRANTY_LOOKUP_URL is required for activation emails',
        );
      }
      const text = [
        `Xin chào ${certificate.request.customerName},`,
        '',
        'Các sản phẩm trong yêu cầu đã được kích hoạt bảo hành:',
        ...items.map(
          (item) =>
            `- ${item.positionLabel}: ${item.productName} | ${item.serialNumber ?? '-'} | ${item.warrantyCode}`,
        ),
        '',
        withoutPdf
          ? 'Bảo hành đã có hiệu lực. Email này không đính kèm chứng nhận PDF.'
          : 'Chứng nhận bảo hành được đính kèm trong email này.',
        `Tra cứu bảo hành: ${lookupUrl}`,
      ].join('\n');

      const queued = await this.repository.update(certificate.id, {
        emailStatus: WARRANTY_CERTIFICATE_EMAIL_STATUS.QUEUED,
        emailedAt: null,
        lastError: withoutPdf ? certificate.lastError : null,
      });
      await this.sendEmailUseCase.execute({
        attachments: pdf
          ? [
              {
                contentBase64: pdf.toString('base64'),
                contentType: 'application/pdf',
                filename: `${certificate.certificateNumber}.pdf`,
              },
            ]
          : undefined,
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
          withoutPdf,
          lookupUrl,
        },
        subject,
        template: 'warranty-certificates',
        text,
        to: certificate.recipientEmail,
        warrantyActivationRequestCertificateId: certificate.id,
      });

      return queued;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue request certificate email ${certificate.id}: ${message}`,
      );
      await this.repository.update(certificate.id, {
        emailStatus: WARRANTY_CERTIFICATE_EMAIL_STATUS.FAILED,
        lastError:
          withoutPdf && certificate.lastError
            ? `${certificate.lastError} | Email: ${message}`
            : message,
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
