import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendWarrantyActivationRequestCertificateEmailUseCase {
  constructor(
    private readonly certificateEmailService: WarrantyActivationRequestCertificateEmailService,
  ) {}

  execute(certificateId: string) {
    return this.certificateEmailService.queueEmail(certificateId);
  }
}
