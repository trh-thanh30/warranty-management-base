import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
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

      const customerName = request?.customerName ?? 'Quý khách';
      const certificateContext = certificates.map((certificate) => ({
        certificateNumber: certificate.certificateNumber,
        productName:
          certificate.warranty.product.displayName ??
          certificate.warranty.product.template.name,
        serialNumber: certificate.warranty.product.serialNumber ?? '-',
        warrantyCode: certificate.warranty.warrantyCode ?? '-',
      }));
      const subject = `Chứng nhận bảo hành điện tử (${certificates.length} sản phẩm)`;
      const text = [
        `Xin chào ${customerName},`,
        '',
        'Các sản phẩm của Quý khách đã được kích hoạt bảo hành thành công:',
        ...certificateContext.map(
          (certificate) =>
            `- ${certificate.productName}: ${certificate.warrantyCode} (${certificate.certificateNumber})`,
        ),
        '',
        'Các file chứng nhận PDF được đính kèm trong email này.',
      ].join('\n');

      await this.sendEmailUseCase.execute({
        attachments,
        context: {
          certificateCount: certificates.length,
          certificates: certificateContext,
          customerName,
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
