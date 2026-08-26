import { BadRequestError, NotFoundError } from '@/common/response';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { normalizeWarrantyCertificateEmailLocale } from '@/modules/warranty-certificates/warranty-certificates.types';
import { Injectable } from '@nestjs/common';
import { warranty_activation_request_status } from '@prisma/client';

@Injectable()
export class RetryWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestsRepository,
    private readonly issueWarrantyCertificateUseCase: IssueWarrantyCertificateUseCase,
  ) {}

  async execute(requestId: string, itemId?: string) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Warranty activation request not found');
    }
    if (request.status !== warranty_activation_request_status.ACTIVATED) {
      throw new BadRequestError(
        'Certificate issuance can only be retried for an activated request',
        'BAD_REQUEST',
        { code: 'WARRANTY_ACTIVATION_REQUEST_NOT_ACTIVATED' },
      );
    }

    const warrantyId = itemId
      ? request.items?.find((item) => item.id === itemId)?.warranty_id
      : request.activated_warranty_id;
    if (!warrantyId) {
      throw new NotFoundError(
        itemId
          ? 'Warranty activation request item not found'
          : 'Activated warranty not found',
      );
    }

    const requestedLocale = this.readLocale(request.metadata);
    await this.issueWarrantyCertificateUseCase.execute({
      ...(requestedLocale
        ? { locale: normalizeWarrantyCertificateEmailLocale(requestedLocale) }
        : {}),
      recipientEmail: request.customer_email ?? undefined,
      requestId,
      warrantyId,
    });

    const updatedRequest = await this.repository.findById(requestId);
    if (!updatedRequest) {
      throw new NotFoundError('Warranty activation request not found');
    }

    return toWarrantyActivationRequestResponse(updatedRequest);
  }

  private readLocale(metadata: unknown) {
    return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>).locale
      : undefined;
  }
}
