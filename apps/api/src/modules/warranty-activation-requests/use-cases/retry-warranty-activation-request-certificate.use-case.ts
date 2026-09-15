import { BadRequestError, NotFoundError } from '@/common/response';
import {
  DealerAccessActor,
  DealerAccessPolicy,
} from '@/modules/dealers/service/dealer-access.policy';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { Injectable } from '@nestjs/common';
import { warranty_activation_request_status } from '@prisma/client';

@Injectable()
export class RetryWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestsRepository,
    private readonly issueRequestCertificateUseCase: IssueWarrantyActivationRequestCertificateUseCase,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(requestId: string, actor?: DealerAccessActor) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Warranty activation request not found');
    }
    if (actor) {
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        actor,
        request.dealer_id,
      );
    }
    if (request.status !== warranty_activation_request_status.ACTIVATED) {
      throw new BadRequestError(
        'Certificate issuance can only be retried for an activated request',
        'BAD_REQUEST',
        { code: 'WARRANTY_ACTIVATION_REQUEST_NOT_ACTIVATED' },
      );
    }

    await this.issueRequestCertificateUseCase.execute({
      regenerateOutdated: true,
      recipientEmail: request.customer_email ?? undefined,
      requestId,
      sendEmail: false,
    });

    const updatedRequest = await this.repository.findById(requestId);
    if (!updatedRequest) {
      throw new NotFoundError('Warranty activation request not found');
    }

    return toWarrantyActivationRequestResponse(updatedRequest);
  }
}
