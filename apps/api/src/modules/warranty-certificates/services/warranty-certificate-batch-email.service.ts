import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import {
  normalizeWarrantyCertificateEmailLocale,
  WarrantyCertificateEmailLocale,
} from '@/modules/warranty-certificates/warranty-certificates.types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WarrantyCertificateBatchEmailService {
  private readonly logger = new Logger(
    WarrantyCertificateBatchEmailService.name,
  );

  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async queueEmail(input: {
    certificateIds: string[];
    recipientEmail: string;
    requestId: string;
    locale?: WarrantyCertificateEmailLocale;
  }) {
    const certificateIds = [...new Set(input.certificateIds)];
    if (certificateIds.length === 0) return;

    const [request, unorderedCertificates] = await Promise.all([
      this.warrantyCertificatesRepository.findBatchEmailRequest(
        input.requestId,
      ),
      this.warrantyCertificatesRepository.findBatchEmailCertificates(
        certificateIds,
      ),
    ]);
    const byId = new Map(
      unorderedCertificates.map((certificate) => [certificate.id, certificate]),
    );
    const certificates: Array<
      (typeof unorderedCertificates)[number] & { storageKey: string }
    > = [];
    for (const id of certificateIds) {
      const certificate = byId.get(id);
      if (!certificate?.storageKey) {
        throw new Error(
          'One or more warranty certificate PDFs are unavailable',
        );
      }
      certificates.push(
        certificate as (typeof unorderedCertificates)[number] & {
          storageKey: string;
        },
      );
    }

    try {
      const attachments: Array<{
        contentBase64: string;
        contentType: string;
        filename: string;
      }> = [];
      for (const certificate of certificates) {
        const stream = await this.uploadAssetService.getStream(
          certificate.storageKey,
        );
        attachments.push({
          contentBase64: (await this.streamToBuffer(stream)).toString('base64'),
          contentType: 'application/pdf',
          filename: `${certificate.certificateNumber}.pdf`,
        });
      }

      const locale = normalizeWarrantyCertificateEmailLocale(
        input.locale ?? request?.locale,
      );
      const copy = getBatchEmailCopy(locale);
      const customerName = request?.customerName ?? copy.defaultCustomerName;
      const certificateContext = certificates.map((certificate) => ({
        certificateNumber: certificate.certificateNumber,
        productName:
          certificate.warranty.product.displayName ??
          certificate.warranty.product.template.name,
        serialNumber: certificate.warranty.product.serialNumber ?? '-',
        warrantyCode: certificate.warranty.warrantyCode ?? '-',
        labels: copy.labels,
      }));
      const subject = copy.subject(certificates.length);
      const text = [
        copy.greeting(customerName),
        '',
        copy.introduction,
        ...certificateContext.map(
          (certificate) =>
            `- ${certificate.productName}: ${certificate.warrantyCode} (${certificate.certificateNumber})`,
        ),
        '',
        copy.attachmentNotice,
      ].join('\n');

      await this.sendEmailUseCase.execute({
        attachments,
        context: {
          certificateCount: certificates.length,
          certificates: certificateContext,
          customerName,
          labels: copy.labels,
          locale,
          preview: copy.labels.preview(certificates.length),
          summary: copy.labels.summary(certificates.length),
          subject,
        },
        subject,
        template: 'warranty-certificates',
        text,
        to: input.recipientEmail,
        warrantyCertificateIds: certificateIds,
      });

      await this.warrantyCertificatesRepository.markEmailQueued(
        certificateIds,
        new Date(),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue certificate batch email for request ${input.requestId}: ${message}`,
      );
      await this.warrantyCertificatesRepository.markEmailQueueFailed(
        certificateIds,
        message,
      );
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}

type BatchEmailCopy = {
  attachmentNotice: string;
  defaultCustomerName: string;
  greeting: (customerName: string) => string;
  introduction: string;
  labels: {
    certificateNumber: string;
    product: string;
    warrantyCode: string;
    closing: string;
    preview: (count: number) => string;
    heading: string;
    summary: (count: number) => string;
    description: string;
  };
  subject: (count: number) => string;
};

function getBatchEmailCopy(
  locale: WarrantyCertificateEmailLocale,
): BatchEmailCopy {
  if (locale === 'en') {
    return {
      attachmentNotice: 'The certificate PDF files are attached to this email.',
      defaultCustomerName: 'Customer',
      greeting: (customerName) => `Hello ${customerName},`,
      introduction:
        'The following products have been successfully activated for warranty coverage:',
      labels: {
        certificateNumber: 'Certificate number',
        product: 'Product',
        warrantyCode: 'Warranty code',
        closing:
          'Please keep this email for reference when you need warranty support.',
        preview: (count) =>
          `${count} electronic warranty certificate${count === 1 ? '' : 's'} created.`,
        heading: 'Electronic warranty certificates',
        summary: (count) =>
          `${count} product${count === 1 ? '' : 's'} activated for warranty coverage.`,
        description:
          'The following products have been successfully activated for warranty coverage. All certificate PDF files are attached to this email.',
      },
      subject: (count) =>
        `Electronic warranty certificates (${count} product${count === 1 ? '' : 's'})`,
    };
  }

  return {
    attachmentNotice: 'Các file chứng nhận PDF được đính kèm trong email này.',
    defaultCustomerName: 'Quý khách',
    greeting: (customerName) => `Xin chào ${customerName},`,
    introduction:
      'Các sản phẩm của Quý khách đã được kích hoạt bảo hành thành công:',
    labels: {
      certificateNumber: 'Mã chứng nhận',
      product: 'Sản phẩm',
      warrantyCode: 'Mã bảo hành',
      closing: 'Vui lòng lưu email này để đối chiếu khi cần hỗ trợ bảo hành.',
      preview: (count) => `${count} chứng nhận bảo hành điện tử đã được tạo.`,
      heading: 'Chứng nhận bảo hành điện tử',
      summary: (count) => `${count} sản phẩm đã được kích hoạt bảo hành.`,
      description:
        'Các sản phẩm dưới đây đã được kích hoạt bảo hành thành công. Toàn bộ file PDF chứng nhận được đính kèm trong email này.',
    },
    subject: (count) => `Chứng nhận bảo hành điện tử (${count} sản phẩm)`,
  };
}
