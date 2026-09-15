import { BadRequestError, NotFoundError } from '@/common/response';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { ASSET_ACCESS_TYPE } from '@/modules/assets/types/assets.types';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import type {
  WarrantyActivationRequestCertificateRecord,
  WarrantyActivationRequestForCertificateIssuance,
} from '@/modules/warranty-certificates/types/warranty-activation-request-certificate.types';
import {
  WARRANTY_CERTIFICATE_EMAIL_STATUS,
  WARRANTY_CERTIFICATE_STATUS,
} from '@/modules/warranty-certificates/types/warranty-certificates.types';
import {
  generateCertificateNumber,
  isCertificateNumberConflict,
} from '@/modules/warranty-certificates/utils/warranty-certificate-number.util';
import { buildRequestWarrantyCertificateViewModel } from '@/modules/warranty-certificates/utils/warranty-certificate-view-model.util';
import {
  needsRequestCertificateRegeneration,
  REQUEST_CERTIFICATE_TEMPLATE_VERSION,
} from '@/modules/warranty-certificates/utils/request-certificate-template-version.util';
import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'node:stream';

const CERTIFICATE_NUMBER_GENERATION_ATTEMPTS = 3;
const ACTIVATED_REQUEST_STATUS = 'ACTIVATED';

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

  async execute(input: {
    regenerateOutdated?: boolean;
    recipientEmail?: string;
    requestId: string;
    // Approval defaults to email delivery; explicit PDF retry opts out.
    sendEmail?: boolean;
  }) {
    const existing = await this.repository.findByRequestId(input.requestId);
    if (
      existing?.status === WARRANTY_CERTIFICATE_STATUS.GENERATED &&
      existing.storageKey &&
      (!input.regenerateOutdated ||
        !needsRequestCertificateRegeneration(existing.metadata))
    ) {
      return existing;
    }

    const request = await this.repository.findRequestForIssuance(
      input.requestId,
    );
    if (!request) {
      throw new NotFoundError(
        'Warranty activation request',
        'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
        { requestId: input.requestId },
      );
    }

    const activatedItemCount = request.items.filter(
      (item) =>
        item.status === ACTIVATED_REQUEST_STATUS && item.activatedAt !== null,
    ).length;
    if (
      request.status !== ACTIVATED_REQUEST_STATUS ||
      activatedItemCount === 0
    ) {
      throw new BadRequestError(
        'Chỉ có thể phát hành chứng nhận cho yêu cầu đã kích hoạt bảo hành.',
        'WARRANTY_ACTIVATION_REQUEST_NOT_ELIGIBLE_FOR_CERTIFICATE',
        {
          activatedItemCount,
          itemCount: request.items.length,
          requestId: input.requestId,
          requestStatus: request.status,
        },
      );
    }

    let certificate: WarrantyActivationRequestCertificateRecord;
    try {
      certificate = await this.generateCertificate({
        existing,
        input,
        request,
      });
    } catch (error) {
      const failed = await this.recordFailure(existing, input, error);
      if (input.sendEmail !== false && failed?.recipientEmail) {
        try {
          const confirmation = await this.emailService.queueEmail(failed.id);
          this.logger.warn(
            `Request ${input.requestId}: PDF unavailable (${String(error)}); confirmation email queued or already sent.`,
          );
          return confirmation ?? failed;
        } catch (emailError) {
          this.logger.error(
            `Could not queue activation confirmation email: ${String(emailError)}`,
          );
        }
      }
      throw error;
    }

    if (
      input.sendEmail === false ||
      !certificate.recipientEmail ||
      certificate.emailStatus === 'QUEUED' ||
      certificate.emailStatus === 'SENT'
    )
      return certificate;
    return this.emailService.queueEmail(certificate.id);
  }

  private async generateCertificate(input: {
    existing: WarrantyActivationRequestCertificateRecord | null;
    input: { recipientEmail?: string; requestId: string };
    request: WarrantyActivationRequestForCertificateIssuance;
  }) {
    for (
      let attempt = 0;
      attempt < CERTIFICATE_NUMBER_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      let uploadedPath: string | null = null;
      try {
        const certificateNumber =
          input.existing?.certificateNumber ?? generateCertificateNumber();
        const viewModel = buildRequestWarrantyCertificateViewModel({
          certificateNumber,
          customerAddress: input.request.fullAddress,
          customerEmail: input.request.customerEmail,
          customerName: input.request.customerName,
          customerPhone: input.request.customerPhone,
          dealerName: input.request.dealerName,
          installedAt: input.request.installedAt,
          items: input.request.items.map((item) => ({
            durationMonths: item.durationMonths,
            endDate: item.endDate,
            positionLabel: item.positionLabel,
            productCode: item.productCode,
            productName: item.productName,
            serialNumber: item.serialNumber,
            warrantyCode: item.warrantyCode,
          })),
          vehicleModel: input.request.vehicleModel,
          vehiclePlate: input.request.vehiclePlate,
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
            accessType: ASSET_ACCESS_TYPE.PRIVATE,
            folder: 'warranty-activation-request-certificates',
          },
        );
        uploadedPath = uploaded.path;
        const data = {
          certificateNumber,
          emailStatus:
            input.existing?.emailStatus ??
            WARRANTY_CERTIFICATE_EMAIL_STATUS.PENDING,
          generatedAt: new Date(),
          lastError: null,
          metadata: {
            itemCount: input.request.items.length,
            requestId: input.input.requestId,
            templateVersion: REQUEST_CERTIFICATE_TEMPLATE_VERSION,
            warrantyCodes: input.request.items.map((item) => item.warrantyCode),
          },
          recipientEmail:
            normalizeEmail(input.input.recipientEmail) ??
            input.existing?.recipientEmail ??
            null,
          status: WARRANTY_CERTIFICATE_STATUS.GENERATED,
          storageKey: uploaded.path,
        };

        const saved = input.existing
          ? this.repository.update(input.existing.id, data)
          : this.repository.create({
              ...data,
              activationRequestId: input.input.requestId,
            });
        const certificate = await saved;

        if (
          input.existing?.storageKey &&
          input.existing.storageKey !== uploaded.path
        ) {
          await this.uploadAssetService
            .delete(input.existing.storageKey)
            .catch((cleanup) =>
              this.logger.error(
                `Failed to delete superseded request certificate: ${String(cleanup)}`,
              ),
            );
        }

        return certificate;
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
    existing: WarrantyActivationRequestCertificateRecord | null,
    input: { recipientEmail?: string; requestId: string },
    error: unknown,
  ) {
    // A failed refresh must not invalidate the previously generated PDF.
    if (
      existing?.status === WARRANTY_CERTIFICATE_STATUS.GENERATED &&
      existing.storageKey
    ) {
      try {
        return await this.repository.update(existing.id, {
          lastError: error instanceof Error ? error.message : String(error),
          status: existing.status,
          storageKey: existing.storageKey,
        });
      } catch (persistenceError) {
        this.logger.error(
          `Failed to persist request certificate refresh error: ${String(persistenceError)}`,
        );
        return null;
      }
    }

    const data = {
      emailStatus:
        existing?.emailStatus ?? WARRANTY_CERTIFICATE_EMAIL_STATUS.PENDING,
      lastError: error instanceof Error ? error.message : String(error),
      recipientEmail:
        normalizeEmail(input.recipientEmail) ??
        existing?.recipientEmail ??
        null,
      status: WARRANTY_CERTIFICATE_STATUS.FAILED,
      storageKey: null,
    };
    try {
      if (existing) {
        return await this.repository.update(existing.id, data);
      } else {
        return await this.repository.create({
          ...data,
          activationRequestId: input.requestId,
          certificateNumber: generateCertificateNumber(),
        });
      }
    } catch (persistenceError) {
      this.logger.error(
        `Failed to persist request certificate error: ${String(persistenceError)}`,
      );
      return null;
    }
  }
}

function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() || null;
}
