import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { Injectable, Logger } from '@nestjs/common';
import { warranty_certificate_email_status } from '@prisma/client';

@Injectable()
export class WarrantyCertificateEmailQueueService {
  private readonly logger = new Logger(
    WarrantyCertificateEmailQueueService.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly emailContentService: WarrantyCertificateEmailContentService,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async queueEmail(certificateId: string) {
    const certificate = await this.prismaService.warrantyCertificate.findUnique(
      {
        where: { id: certificateId },
        include: {
          warranty: {
            include: {
              product: {
                include: {
                  template: true,
                  ownerships: {
                    where: { is_current_owner: true },
                    include: { customer: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    );

    if (!certificate) {
      throw new Error('Warranty certificate not found while queueing email');
    }

    const currentCustomer =
      certificate.warranty.product.ownerships[0]?.customer;
    if (!certificate.recipient_email) {
      throw new Error('Warranty certificate recipient email is required');
    }
    if (!certificate.storage_key) {
      throw new Error('Warranty certificate PDF is not available in storage');
    }

    const requestId = this.getRequestId(certificate.metadata);
    const request = requestId
      ? await this.prismaService.warrantyActivationRequest.findUnique({
          where: { id: requestId },
          include: { dealer: true },
        })
      : null;
    const emailInput = {
      certificateNumber: certificate.certificate_number,
      customerAddress: request?.full_address ?? null,
      customerEmail: request?.customer_email ?? currentCustomer?.email ?? null,
      customerName:
        request?.customer_name ?? currentCustomer?.full_name ?? 'Quý khách',
      customerPhone: request?.customer_phone ?? currentCustomer?.phone ?? null,
      dealerName:
        request?.dealer?.name ?? this.getDealerName(request?.metadata),
      endDate: certificate.warranty.end_date,
      filmItems: this.getFilmItems(request?.metadata),
      installedAt: request?.installed_at ?? certificate.warranty.start_date,
      productName:
        certificate.warranty.product.display_name ??
        certificate.warranty.product.template.name,
      serialNumber: certificate.warranty.product.serial_number,
      startDate: certificate.warranty.start_date,
      vehicleModel: request?.vehicle_model ?? null,
      vehiclePlate: request?.vehicle_plate ?? null,
      warrantyDurationMonths:
        request?.warranty_duration_months ??
        certificate.warranty.duration_months,
      warrantyCode: certificate.warranty.warranty_code,
    };

    try {
      const pdfStream = await this.uploadAssetService.getStream(
        certificate.storage_key,
      );
      const pdfBuffer = await this.streamToBuffer(pdfStream);

      await this.sendEmailUseCase.execute({
        attachments: [
          {
            contentBase64: pdfBuffer.toString('base64'),
            contentType: 'application/pdf',
            filename: `${certificate.certificate_number}.pdf`,
          },
        ],
        context: this.emailContentService.buildTemplateContext(emailInput),
        template: 'warranty-certificate',
        to: certificate.recipient_email,
        subject: this.emailContentService.buildSubject(emailInput),
        text: this.emailContentService.buildText(emailInput),
        warrantyCertificateId: certificate.id,
      });

      return this.prismaService.warrantyCertificate.update({
        where: { id: certificate.id },
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
        `Failed to queue warranty certificate email ${certificate.id}: ${message}`,
      );

      return this.prismaService.warrantyCertificate.update({
        where: { id: certificate.id },
        data: {
          email_status: warranty_certificate_email_status.FAILED,
          last_error: message,
        },
      });
    }
  }

  private getRequestId(metadata: unknown) {
    const record = this.toRecord(metadata);
    return typeof record?.requestId === 'string' ? record.requestId : null;
  }

  private getDealerName(metadata: unknown) {
    const record = this.toRecord(metadata);
    const dealer = this.toRecord(record?.dealer);
    return typeof dealer?.name === 'string' ? dealer.name : null;
  }

  private getFilmItems(metadata: unknown) {
    const record = this.toRecord(metadata);
    const filmItems = this.toRecord(record?.filmItems);
    if (!filmItems) return null;

    return Object.fromEntries(
      Object.entries(filmItems).filter(
        ([, value]) => typeof value === 'string',
      ),
    ) as Record<string, string>;
  }

  private toRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}
