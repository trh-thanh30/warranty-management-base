import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteWarrantyCertificateUseCase {
  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(certificateId: string) {
    const certificate =
      await this.warrantyCertificatesRepository.findForDeletion(certificateId);

    if (!certificate) {
      throw new NotFoundException('Warranty certificate not found');
    }

    if (certificate.storageKey) {
      await this.uploadAssetService.delete(certificate.storageKey);
    }

    return this.warrantyCertificatesRepository.delete(certificate.id);
  }
}
