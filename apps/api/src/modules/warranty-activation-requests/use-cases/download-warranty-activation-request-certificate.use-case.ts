import { NotFoundError } from '@/common/response';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly getWarrantyCertificateFileUseCase: GetWarrantyCertificateFileForActivationRequestUseCase,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(requestId: string, itemId?: string) {
    const certificate = await this.getWarrantyCertificateFileUseCase.execute(
      requestId,
      itemId,
    );

    return this.toCertificateFile(certificate ?? undefined);
  }

  private async toCertificateFile(
    certificate:
      | { certificateNumber: string; storageKey: string | null }
      | undefined,
  ) {
    if (!certificate?.storageKey) {
      throw new NotFoundError('Warranty activation certificate not found');
    }

    return {
      filename: `${certificate.certificateNumber}.pdf`,
      stream: await this.uploadAssetService.getStream(certificate.storageKey),
    };
  }
}
