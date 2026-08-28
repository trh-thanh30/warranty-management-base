import { NotFoundError } from '@/common/response';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { WARRANTY_CERTIFICATE_STATUS } from '@/modules/warranty-certificates/warranty-certificates.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendWarrantyActivationRequestCertificateEmailUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestCertificatesRepository,
    private readonly certificateEmailService: WarrantyActivationRequestCertificateEmailService,
    private readonly issueCertificateUseCase: IssueWarrantyActivationRequestCertificateUseCase,
  ) {}

  async execute(requestId: string) {
    const certificate = await this.repository.findByRequestId(requestId);
    if (!certificate) {
      throw new NotFoundError(
        'Warranty activation certificate not found',
        'WARRANTY_ACTIVATION_CERTIFICATE_NOT_FOUND',
        { requestId },
      );
    }

    if (certificate.status === WARRANTY_CERTIFICATE_STATUS.FAILED) {
      return this.issueCertificateUseCase.execute({
        recipientEmail: certificate.recipientEmail ?? undefined,
        requestId,
      });
    }

    return this.certificateEmailService.queueEmail(certificate.id);
  }
}
