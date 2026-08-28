import { NotFoundError } from '@/common/response';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { ResendWarrantyActivationRequestCertificateEmailUseCase as ResendRequestCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import { Injectable } from '@nestjs/common';
import { warranty_certificate_status } from '@prisma/client';

@Injectable()
export class ResendWarrantyActivationRequestCertificateEmailUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestsRepository,
    private readonly resendRequestCertificateEmailUseCase: ResendRequestCertificateEmailUseCase,
    private readonly issueRequestCertificateUseCase: IssueWarrantyActivationRequestCertificateUseCase,
  ) {}

  async execute(requestId: string) {
    const request = await this.repository.findById(requestId);
    const certificate = request?.certificate;

    if (!request) {
      throw new NotFoundError(
        'Warranty activation request not found',
        'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
        { requestId },
      );
    }
    if (!certificate) {
      throw new NotFoundError(
        'Warranty activation certificate not found',
        'WARRANTY_ACTIVATION_CERTIFICATE_NOT_FOUND',
        { requestId },
      );
    }

    if (certificate.status === warranty_certificate_status.FAILED) {
      await this.issueRequestCertificateUseCase.execute({
        recipientEmail: certificate.recipient_email ?? undefined,
        requestId,
      });
    } else {
      await this.resendRequestCertificateEmailUseCase.execute(certificate.id);
    }

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
