import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyCertificateFileForActivationRequestUseCase {
  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
  ) {}

  execute(requestId: string, itemId?: string) {
    return this.warrantyCertificatesRepository.findLatestFileForActivationRequest(
      requestId,
      itemId,
    );
  }
}
