import { NotFoundError } from '@/common/response';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(requestId: string, itemId?: string) {
    const certificate =
      await this.warrantyCertificatesRepository.findLatestFileForActivationRequest(
        requestId,
        itemId,
      );

    return this.toCertificateFile(certificate ?? undefined);
  }

  private async toCertificateFile(
    certificate:
      | { certificate_number: string; storage_key: string | null }
      | undefined,
  ) {
    if (!certificate?.storage_key) {
      throw new NotFoundError('Warranty activation certificate not found');
    }

    return {
      filename: `${certificate.certificate_number}.pdf`,
      stream: await this.uploadAssetService.getStream(certificate.storage_key),
    };
  }
}
