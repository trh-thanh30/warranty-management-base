import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WarrantyCertificateEmailQueueService {
  private readonly logger = new Logger(
    WarrantyCertificateEmailQueueService.name,
  );

  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly emailContentService: WarrantyCertificateEmailContentService,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async queueEmail(certificateId: string) {
    const certificate =
      await this.warrantyCertificatesRepository.findForEmail(certificateId);

    if (!certificate) {
      throw new Error('Warranty certificate not found while queueing email');
    }

    const currentCustomer =
      certificate.warranty.product.ownerships[0]?.customer;
    if (!certificate.recipientEmail) {
      throw new Error('Warranty certificate recipient email is required');
    }
    if (!certificate.storageKey) {
      throw new Error('Warranty certificate PDF is not available in storage');
    }

    const requestId = this.getRequestId(certificate.metadata);
    const request = requestId
      ? await this.warrantyCertificatesRepository.findActivationRequestForCertificate(
          requestId,
        )
      : null;
    const emailInput = {
      certificateNumber: certificate.certificateNumber,
      customerAddress: request?.fullAddress ?? null,
      customerEmail: request?.customerEmail ?? currentCustomer?.email ?? null,
      customerName:
        request?.customerName ?? currentCustomer?.fullName ?? 'Quý khách',
      customerPhone: request?.customerPhone ?? currentCustomer?.phone ?? null,
      dealerName:
        request?.dealer?.name ?? this.getDealerName(request?.metadata),
      endDate: certificate.warranty.endDate,
      filmItems: this.getFilmItems(request?.metadata),
      installedAt: request?.installedAt ?? certificate.warranty.startDate,
      productName:
        certificate.warranty.product.displayName ??
        certificate.warranty.product.name,
      serialNumber: certificate.warranty.product.serialNumber,
      startDate: certificate.warranty.startDate,
      vehicleModel: request?.vehicleModel ?? null,
      vehiclePlate: request?.vehiclePlate ?? null,
      warrantyDurationMonths:
        request?.warrantyDurationMonths ?? certificate.warranty.durationMonths,
      warrantyCode: certificate.warranty.warrantyCode,
    };

    try {
      const pdfStream = await this.uploadAssetService.getStream(
        certificate.storageKey,
      );
      const pdfBuffer = await this.streamToBuffer(pdfStream);

      await this.sendEmailUseCase.execute({
        attachments: [
          {
            contentBase64: pdfBuffer.toString('base64'),
            contentType: 'application/pdf',
            filename: `${certificate.certificateNumber}.pdf`,
          },
        ],
        context: this.emailContentService.buildTemplateContext(emailInput),
        template: 'warranty-certificate',
        to: certificate.recipientEmail,
        subject: this.emailContentService.buildSubject(emailInput),
        text: this.emailContentService.buildText(emailInput),
        warrantyCertificateId: certificate.id,
      });

      await this.warrantyCertificatesRepository.markEmailQueued(
        [certificate.id],
        new Date(),
      );

      return (
        (await this.warrantyCertificatesRepository.findById(certificate.id)) ??
        certificate
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email queue error';
      this.logger.error(
        `Failed to queue warranty certificate email ${certificate.id}: ${message}`,
      );

      await this.warrantyCertificatesRepository.markEmailQueueFailed(
        [certificate.id],
        message,
      );

      return (
        (await this.warrantyCertificatesRepository.findById(certificate.id)) ??
        certificate
      );
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
