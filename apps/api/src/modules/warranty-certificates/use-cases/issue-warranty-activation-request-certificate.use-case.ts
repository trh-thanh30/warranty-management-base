import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import { buildRequestWarrantyCertificateViewModel } from '@/modules/warranty-certificates/utils/warranty-certificate-view-model.util';
import {
  generateCertificateNumber,
  isCertificateNumberConflict,
} from '@/modules/warranty-certificates/utils/warranty-certificate-number.util';
import { Injectable, Logger } from '@nestjs/common';
import {
  asset_access_type,
  warranty_certificate_email_status,
  warranty_certificate_status,
  type WarrantyActivationRequestCertificate,
} from '@prisma/client';
import { Readable } from 'node:stream';

const CERTIFICATE_NUMBER_GENERATION_ATTEMPTS = 3;

@Injectable()
export class IssueWarrantyActivationRequestCertificateUseCase {
  private readonly logger = new Logger(
    IssueWarrantyActivationRequestCertificateUseCase.name,
  );

  constructor(
    private readonly repository: WarrantyActivationRequestCertificatesRepository,
    private readonly uploadAssetService: UploadAssetService,
    private readonly pdfService: WarrantyCertificatePdfService,
    private readonly emailService: WarrantyActivationRequestCertificateEmailService,
  ) {}

  async execute(input: { recipientEmail?: string; requestId: string }) {
    const existing = await this.repository.findByRequestId(input.requestId);
    if (existing?.status === warranty_certificate_status.GENERATED) {
      return existing;
    }

    const request = await this.repository.findRequestForIssuance(
      input.requestId,
    );
    if (!request) throw new Error('Warranty activation request not found');
    if (request.items.length === 0) {
      throw new Error('Warranty activation request has no items');
    }

    let certificate: WarrantyActivationRequestCertificate;
    try {
      certificate = await this.generateCertificate({
        existing,
        input,
        request,
      });
    } catch (error) {
      await this.recordFailure(existing, input, error);
      throw error;
    }

    if (!input.recipientEmail) return certificate;
    return this.emailService.queueEmail(certificate.id);
  }

  private async generateCertificate(input: {
    existing: WarrantyActivationRequestCertificate | null;
    input: { recipientEmail?: string; requestId: string };
    request: NonNullable<
      Awaited<
        ReturnType<
          WarrantyActivationRequestCertificatesRepository['findRequestForIssuance']
        >
      >
    >;
  }) {
    for (
      let attempt = 0;
      attempt < CERTIFICATE_NUMBER_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      let uploadedPath: string | null = null;
      try {
        const certificateNumber =
          input.existing?.certificate_number ?? generateCertificateNumber();
        const viewModel = buildRequestWarrantyCertificateViewModel({
          certificateNumber,
          customerAddress: input.request.full_address,
          customerEmail: input.request.customer_email,
          customerName: input.request.customer_name,
          customerPhone: input.request.customer_phone,
          dealerName: input.request.dealer?.name,
          installedAt: input.request.installed_at,
          items: input.request.items.map((item) => ({
            durationMonths: item.warranty.duration_months,
            endDate: item.warranty.end_date,
            positionLabel: item.position_label,
            productCode: item.product_code,
            productName: item.product_name,
            serialNumber: item.serial_number,
            warrantyCode: item.warranty_code,
          })),
          vehicleModel: input.request.vehicle_model,
          vehiclePlate: input.request.vehicle_plate,
        });
        const pdfBuffer =
          await this.pdfService.createPdfFromViewModel(viewModel);
        const uploaded = await this.uploadAssetService.upload(
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
            folder: 'warranty-activation-request-certificates',
          },
        );
        uploadedPath = uploaded.path;
        const data = {
          certificate_number: certificateNumber,
          email_status: warranty_certificate_email_status.PENDING,
          generated_at: new Date(),
          last_error: null,
          metadata: {
            itemCount: input.request.items.length,
            requestId: input.input.requestId,
            warrantyCodes: input.request.items.map(
              (item) => item.warranty_code,
            ),
          },
          recipient_email: normalizeEmail(input.input.recipientEmail),
          status: warranty_certificate_status.GENERATED,
          storage_key: uploaded.path,
        };

        return input.existing
          ? this.repository.update(input.existing.id, data)
          : this.repository.create({
              ...data,
              activation_request_id: input.input.requestId,
            });
      } catch (error) {
        if (uploadedPath) {
          await this.uploadAssetService
            .delete(uploadedPath)
            .catch((cleanup) =>
              this.logger.error(
                `Failed to delete request certificate upload: ${String(cleanup)}`,
              ),
            );
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
    throw new Error('Could not generate a unique certificate number');
  }

  private async recordFailure(
    existing: WarrantyActivationRequestCertificate | null,
    input: { recipientEmail?: string; requestId: string },
    error: unknown,
  ) {
    const data = {
      email_status: warranty_certificate_email_status.PENDING,
      last_error: error instanceof Error ? error.message : String(error),
      recipient_email: normalizeEmail(input.recipientEmail),
      status: warranty_certificate_status.FAILED,
      storage_key: null,
    };
    try {
      if (existing) {
        await this.repository.update(existing.id, data);
      } else {
        await this.repository.create({
          ...data,
          activation_request_id: input.requestId,
          certificate_number: generateCertificateNumber(),
        });
      }
    } catch (persistenceError) {
      this.logger.error(
        `Failed to persist request certificate error: ${String(persistenceError)}`,
      );
    }
  }
}

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() || null;
}
