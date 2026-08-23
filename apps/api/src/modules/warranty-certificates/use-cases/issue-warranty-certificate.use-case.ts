import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import {
  generateCertificateNumber,
  isCertificateNumberConflict,
} from '@/modules/warranty-certificates/utils/warranty-certificate-number.util';
import { Injectable, Logger } from '@nestjs/common';
import {
  asset_access_type,
  warranty_certificate_email_status,
  warranty_certificate_status,
  WarrantyActivationRequest,
  WarrantyCertificate,
} from '@prisma/client';
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
      request?.customer_email ??
      currentCustomer?.email ??
      ''
    )
      .trim()
      .toLowerCase();

    const existingCertificate =
      await this.warrantyCertificatesRepository.findLatestByWarrantyId(
        warranty.id,
      );

    if (existingCertificate?.status === warranty_certificate_status.GENERATED) {
      return existingCertificate;
    }

    let certificate: WarrantyCertificate;
    try {
      certificate = await this.createGeneratedCertificate({
        existingCertificate,
        recipientEmail,
        requestId: input.requestId,
        warrantyCode: warranty.warranty_code,
        warrantyId: warranty.id,
      });
    } catch (error) {
      await this.recordGenerationFailure({
        error,
        existingCertificate,
        recipientEmail,
        requestId: input.requestId,
        warrantyCode: warranty.warranty_code,
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
    existingCertificate: WarrantyCertificate | null;
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
          input.existingCertificate?.certificate_number ??
          generateCertificateNumber();
        const pdfBuffer = await this.pdfService.createPdfBuffer({
          certificateNumber,
          customerName:
            request?.customer_name ??
            warranty.product.ownerships[0]?.customer.full_name ??
            'Quy khach',
          customerAddress: request?.full_address ?? null,
          customerEmail: request?.customer_email ?? null,
          customerPhone:
            request?.customer_phone ??
            warranty.product.ownerships[0]?.customer.phone ??
            null,
          dealerName: this.resolveDealerName(request),
          endDate: warranty.end_date,
          filmItems: this.resolveFilmItems(request),
          installedAt: request?.installed_at ?? warranty.start_date,
          productName:
            warranty.product.display_name ?? warranty.product.template.name,
          serialNumber: warranty.product.serial_number,
          startDate: warranty.start_date,
          vehicleModel: request?.vehicle_model ?? null,
          vehiclePlate: request?.vehicle_plate ?? null,
          warrantyDurationMonths:
            request?.warranty_duration_months ?? warranty.duration_months,
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
            accessType: asset_access_type.PRIVATE,
            folder: 'warranty-certificates',
          },
        );
        uploadedPdfPath = uploadedPdf.path;

        const data = {
          certificate_number: certificateNumber,
          email_status: warranty_certificate_email_status.PENDING,
          generated_at: new Date(),
          metadata: {
            requestId: input.requestId,
            warrantyCode: input.warrantyCode,
          },
          recipient_email: input.recipientEmail || null,
          status: warranty_certificate_status.GENERATED,
          storage_key: uploadedPdf.path,
          warranty: { connect: { id: input.warrantyId } },
        };

        if (input.existingCertificate) {
          return await this.warrantyCertificatesRepository.update(
            input.existingCertificate.id,
            {
              email_status: data.email_status,
              generated_at: data.generated_at,
              last_error: null,
              metadata: data.metadata,
              recipient_email: data.recipient_email,
              status: data.status,
              storage_key: data.storage_key,
            },
          );
        }

        return await this.warrantyCertificatesRepository.create(data);
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
    existingCertificate: WarrantyCertificate | null;
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
      email_status: warranty_certificate_email_status.PENDING,
      last_error: message,
      metadata: {
        requestId: input.requestId,
        warrantyCode: input.warrantyCode,
      },
      recipient_email: input.recipientEmail || null,
      status: warranty_certificate_status.FAILED,
      storage_key: null,
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
        certificate_number: generateCertificateNumber(),
        warranty: { connect: { id: input.warrantyId } },
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
    request:
      | (WarrantyActivationRequest & { dealer?: { name: string } | null })
      | null,
  ) {
    if (!request) return null;
    if (request.dealer?.name) return request.dealer.name;

    const metadata = this.toRecord(request.metadata);
    const dealer = this.toRecord(metadata?.dealer);
    return typeof dealer?.name === 'string' ? dealer.name : null;
  }

  private resolveFilmItems(request: WarrantyActivationRequest | null) {
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
