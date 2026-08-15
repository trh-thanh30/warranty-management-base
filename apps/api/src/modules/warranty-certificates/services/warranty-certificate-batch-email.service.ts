import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { Injectable, Logger } from '@nestjs/common';
import { warranty_certificate_email_status } from '@prisma/client';

@Injectable()
export class WarrantyCertificateBatchEmailService {
  private readonly logger = new Logger(
    WarrantyCertificateBatchEmailService.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
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
      this.prismaService.warrantyActivationRequest.findUnique({
        where: { id: input.requestId },
        select: { customer_name: true },
      }),
      this.prismaService.warrantyCertificate.findMany({
        where: { id: { in: certificateIds } },
        include: {
          warranty: {
            include: { product: { include: { template: true } } },
          },
        },
      }),
    ]);
    const byId = new Map(
      unorderedCertificates.map((certificate) => [certificate.id, certificate]),
    );
    const certificates: Array<
      (typeof unorderedCertificates)[number] & { storage_key: string }
    > = [];
    for (const id of certificateIds) {
      const certificate = byId.get(id);
      if (!certificate?.storage_key) {
        throw new Error(
          'One or more warranty certificate PDFs are unavailable',
        );
      }
      certificates.push(
        certificate as (typeof unorderedCertificates)[number] & {
          storage_key: string;
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
          certificate.storage_key,
        );
        attachments.push({
          contentBase64: (await this.streamToBuffer(stream)).toString('base64'),
          contentType: 'application/pdf',
          filename: `${certificate.certificate_number}.pdf`,
        });
      }

      const customerName = request?.customer_name ?? 'Quý khách';
      const certificateContext = certificates.map((certificate) => ({
        certificateNumber: certificate.certificate_number,
        productName:
          certificate.warranty.product.display_name ??
          certificate.warranty.product.template.name,
        serialNumber: certificate.warranty.product.serial_number ?? '-',
        warrantyCode: certificate.warranty.warranty_code ?? '-',
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

      await this.prismaService.warrantyCertificate.updateMany({
        where: { id: { in: certificateIds } },
        data: {
          email_status: warranty_certificate_email_status.QUEUED,
          emailed_at: new Date(),
          last_error: null,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue certificate batch email for request ${input.requestId}: ${message}`,
      );
      await this.prismaService.warrantyCertificate.updateMany({
        where: { id: { in: certificateIds } },
        data: {
          email_status: warranty_certificate_email_status.FAILED,
          last_error: message,
        },
      });
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
