import { BadRequestError } from '@/common/response';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { ResendWarrantyCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-certificate-email.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendWarrantyActivationRequestCertificateEmailUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestsRepository,
    private readonly resendWarrantyCertificateEmailUseCase: ResendWarrantyCertificateEmailUseCase,
  ) {}

  async execute(requestId: string) {
    const request = await this.repository.findById(requestId);
    const certificate = request?.activated_warranty?.certificates?.[0];

    if (!request || !certificate) {
      throw new BadRequestError(
        'WARRANTY_ACTIVATION_CERTIFICATE_NOT_FOUND',
        'Warranty activation certificate not found',
      );
    }

    await this.resendWarrantyCertificateEmailUseCase.execute(certificate.id);

    const updatedRequest = await this.repository.findById(requestId);
    if (!updatedRequest) {
      throw new BadRequestError(
        'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
        'Warranty activation request not found',
      );
    }

    return toWarrantyActivationRequestResponse(updatedRequest);
  }
}
