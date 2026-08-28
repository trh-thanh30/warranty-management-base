import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyCertificateFileForActivationRequestUseCase {
  constructor(
    private readonly requestCertificatesRepository: WarrantyActivationRequestCertificatesRepository,
  ) {}

  execute(requestId: string) {
    return this.requestCertificatesRepository.findFileByRequestId(requestId);
  }
}
