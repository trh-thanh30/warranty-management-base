import { NotFoundError } from '@/common/response';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly repository: WarrantyActivationRequestCertificatesRepository,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(requestId: string) {
    const certificate = await this.repository.findByRequestId(requestId);
    return this.toCertificateFile(certificate);
  }

  private async toCertificateFile(
    certificate:
      | { certificate_number: string; storage_key: string | null }
      | null
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
