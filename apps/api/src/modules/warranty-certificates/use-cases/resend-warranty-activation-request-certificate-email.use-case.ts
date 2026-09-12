import { BadRequestError, NotFoundError } from '@/common/response';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendWarrantyActivationRequestCertificateEmailUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestCertificatesRepository,
    private readonly certificateEmailService: WarrantyActivationRequestCertificateEmailService,
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

    if (certificate.emailStatus === 'QUEUED') {
      throw new BadRequestError(
        'An activation email is already queued',
        'BAD_REQUEST',
        { code: 'WARRANTY_ACTIVATION_EMAIL_ALREADY_QUEUED' },
      );
    }

    return this.certificateEmailService.queueEmail(certificate.id, {
      force: true,
    });
  }
}
