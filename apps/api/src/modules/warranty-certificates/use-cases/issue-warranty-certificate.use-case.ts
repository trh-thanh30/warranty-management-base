import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { ASSET_ACCESS_TYPE } from '@/modules/assets/types/assets.types';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import {
  WarrantyCertificateActivationRequest,
  WarrantyCertificateRecord,
  WARRANTY_CERTIFICATE_EMAIL_STATUS,
  WARRANTY_CERTIFICATE_STATUS,
} from '@/modules/warranty-certificates/warranty-certificates.types';
import {
  generateCertificateNumber,
  isCertificateNumberConflict,
} from '@/modules/warranty-certificates/utils/warranty-certificate-number.util';
import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';

const CERTIFICATE_NUMBER_GENERATION_ATTEMPTS = 3;

@Injectable()
export class IssueWarrantyCertificateUseCase {
  private readonly logger = new Logger(IssueWarrantyCertificateUseCase.name);

  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly uploadAssetService: UploadAssetService,
    private readonly certificateEmailQueueService: WarrantyCertificateEmailQueueService,
    private readonly pdfService: WarrantyCertificatePdfService,
  ) {}

  async execute(input: {
    queueEmail?: boolean;
    recipientEmail?: string;
    warrantyId: string;
    requestId?: string;
  }) {
    const warranty =
      await this.warrantyCertificatesRepository.findWarrantyForCertificate(
        input.warrantyId,
      );

    if (!warranty) {
      throw new Error('Warranty not found while issuing certificate');
    }
    const request = input.requestId
      ? await this.warrantyCertificatesRepository.findActivationRequestForCertificate(
          input.requestId,
        )
      : null;
    const currentCustomer = warranty.product.ownerships[0]?.customer;
    const recipientEmail = (
      input.recipientEmail ??
      request?.customerEmail ??
      currentCustomer?.email ??
      ''
    )
      .trim()
      .toLowerCase();

    const existingCertificate =
      await this.warrantyCertificatesRepository.findLatestByWarrantyId(
        warranty.id,
      );

    if (
      existingCertificate?.status === WARRANTY_CERTIFICATE_STATUS.GENERATED &&
      existingCertificate.storageKey
    ) {
      return existingCertificate;
    }

    let certificate: WarrantyCertificateRecord;
    try {
      certificate = await this.createGeneratedCertificate({
        existingCertificate,
        recipientEmail,
        requestId: input.requestId,
        warrantyCode: warranty.warrantyCode,
        warrantyId: warranty.id,
      });
    } catch (error) {
      await this.recordGenerationFailure({
        error,
        existingCertificate,
        recipientEmail,
        requestId: input.requestId,
        warrantyCode: warranty.warrantyCode,
        warrantyId: warranty.id,
      });
      throw error;
    }

    if (!recipientEmail) {
      this.logger.log(
        `Warranty certificate ${certificate.id} generated without recipient email`,
      );
      return certificate;
    }

    if (input.queueEmail === false) return certificate;

    return this.certificateEmailQueueService.queueEmail(certificate.id);
  }

  private async createGeneratedCertificate(input: {
    existingCertificate: WarrantyCertificateRecord | null;
    recipientEmail: string;
    requestId?: string;
    warrantyCode: string | null;
    warrantyId: string;
  }) {
    const [warranty, request] = await Promise.all([
      this.warrantyCertificatesRepository.findWarrantyForCertificate(
        input.warrantyId,
      ),
      input.requestId
        ? this.warrantyCertificatesRepository.findActivationRequestForCertificate(
            input.requestId,
          )
        : Promise.resolve(null),
    ]);

    if (!warranty) {
      throw new Error('Warranty not found while generating certificate PDF');
    }

    for (
      let attempt = 0;
      attempt < CERTIFICATE_NUMBER_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      let uploadedPdfPath: string | null = null;
      try {
        const certificateNumber =
          input.existingCertificate?.certificateNumber ??
          generateCertificateNumber();
        const pdfBuffer = await this.pdfService.createPdfBuffer({
          certificateNumber,
          customerName:
            request?.customerName ??
            warranty.product.ownerships[0]?.customer.fullName ??
            'Quy khach',
          customerAddress: request?.fullAddress ?? null,
          customerEmail: request?.customerEmail ?? null,
          customerPhone:
            request?.customerPhone ??
            warranty.product.ownerships[0]?.customer.phone ??
            null,
          dealerName: this.resolveDealerName(request),
          endDate: warranty.endDate,
          filmItems: this.resolveFilmItems(request),
          installedAt: request?.installedAt ?? warranty.startDate,
          productName:
            warranty.product.displayName ?? warranty.product.template.name,
          serialNumber: warranty.product.serialNumber,
          startDate: warranty.startDate,
          vehicleModel: request?.vehicleModel ?? null,
          vehiclePlate: request?.vehiclePlate ?? null,
          warrantyDurationMonths:
            request?.warrantyDurationMonths ?? warranty.durationMonths,
          warrantyCode: input.warrantyCode,
        });
        const uploadedPdf = await this.uploadAssetService.upload(
          {
            buffer: pdfBuffer,
            destination: '',
            encoding: '7bit',
            fieldname: 'file',
            filename: `${certificateNumber}.pdf`,
            mimetype: 'application/pdf',
            originalname: `${certificateNumber}.pdf`,
            path: '',
            size: pdfBuffer.byteLength,
            stream: Readable.from(pdfBuffer),
          },
          {
            accessType: ASSET_ACCESS_TYPE.PRIVATE,
            folder: 'warranty-certificates',
          },
        );
        uploadedPdfPath = uploadedPdf.path;

        const data = {
          emailStatus: WARRANTY_CERTIFICATE_EMAIL_STATUS.PENDING,
          generatedAt: new Date(),
          metadata: {
            requestId: input.requestId,
            warrantyCode: input.warrantyCode,
          },
          recipientEmail: input.recipientEmail || null,
          status: WARRANTY_CERTIFICATE_STATUS.GENERATED,
          storageKey: uploadedPdf.path,
        };

        if (input.existingCertificate) {
          return await this.warrantyCertificatesRepository.update(
            input.existingCertificate.id,
            {
              emailStatus: data.emailStatus,
              generatedAt: data.generatedAt,
              lastError: null,
              metadata: data.metadata,
              recipientEmail: data.recipientEmail,
              status: data.status,
              storageKey: data.storageKey,
            },
          );
        }

        return await this.warrantyCertificatesRepository.create({
          ...data,
          certificateNumber,
          warrantyId: input.warrantyId,
        });
      } catch (error) {
        if (uploadedPdfPath) {
          try {
            await this.uploadAssetService.delete(uploadedPdfPath);
          } catch (cleanupError) {
            this.logger.error(
              `Failed to rollback uploaded certificate ${uploadedPdfPath}: ${
                cleanupError instanceof Error
                  ? cleanupError.message
                  : String(cleanupError)
              }`,
            );
          }
        }

        if (
          attempt < CERTIFICATE_NUMBER_GENERATION_ATTEMPTS - 1 &&
          isCertificateNumberConflict(error)
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Could not generate a unique warranty certificate number');
  }

  private async recordGenerationFailure(input: {
    error: unknown;
    existingCertificate: WarrantyCertificateRecord | null;
    recipientEmail: string;
    requestId?: string;
    warrantyCode: string | null;
    warrantyId: string;
  }) {
    const message =
      input.error instanceof Error
        ? input.error.message
        : 'Unknown certificate generation error';
    const data = {
      emailStatus: WARRANTY_CERTIFICATE_EMAIL_STATUS.PENDING,
      lastError: message,
      metadata: {
        requestId: input.requestId,
        warrantyCode: input.warrantyCode,
      },
      recipientEmail: input.recipientEmail || null,
      status: WARRANTY_CERTIFICATE_STATUS.FAILED,
      storageKey: null,
    };

    try {
      if (input.existingCertificate) {
        await this.warrantyCertificatesRepository.update(
          input.existingCertificate.id,
          data,
        );
        return;
      }

      await this.warrantyCertificatesRepository.create({
        ...data,
        certificateNumber: generateCertificateNumber(),
        warrantyId: input.warrantyId,
      });
    } catch (persistenceError) {
      this.logger.error(
        `Failed to persist certificate generation error for warranty ${input.warrantyId}: ${
          persistenceError instanceof Error
            ? persistenceError.message
            : String(persistenceError)
        }`,
      );
    }
  }

  private resolveDealerName(
    request: WarrantyCertificateActivationRequest | null,
  ) {
    if (!request) return null;
    if (request.dealer?.name) return request.dealer.name;

    const metadata = this.toRecord(request.metadata);
    const dealer = this.toRecord(metadata?.dealer);
    return typeof dealer?.name === 'string' ? dealer.name : null;
  }

  private resolveFilmItems(
    request: WarrantyCertificateActivationRequest | null,
  ) {
    const metadata = this.toRecord(request?.metadata);
    const filmItems = this.toRecord(metadata?.filmItems);
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
}
