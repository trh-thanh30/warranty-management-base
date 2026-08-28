import { NotFoundError } from '@/common/response';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { ResendWarrantyActivationRequestCertificateEmailUseCase as ResendRequestCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendWarrantyActivationRequestCertificateEmailUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestsRepository,
    private readonly resendRequestCertificateEmailUseCase: ResendRequestCertificateEmailUseCase,
  ) {}

  async execute(requestId: string) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new NotFoundError(
        'Warranty activation request not found',
        'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
        { requestId },
      );
    }
    await this.resendRequestCertificateEmailUseCase.execute(requestId);

    const updatedRequest = await this.repository.findById(requestId);
    if (!updatedRequest) {
      throw new NotFoundError(
        'Warranty activation request not found',
        'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
        { requestId },
      );
    }

    return toWarrantyActivationRequestResponse(updatedRequest);
  }
}
