import { NotFoundError } from '@/common/response';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import {
  DealerAccessActor,
  DealerAccessPolicy,
} from '@/modules/dealers/service/dealer-access.policy';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly getWarrantyCertificateFileUseCase: GetWarrantyCertificateFileForActivationRequestUseCase,
    private readonly uploadAssetService: UploadAssetService,
    private readonly repository?: WarrantyActivationRequestsRepository,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(requestId: string, actor?: DealerAccessActor) {
    if (actor) {
      const request = await this.repository!.findById(requestId);
      if (!request) {
        throw new NotFoundError('Warranty activation request not found');
      }
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        actor,
        request.dealer_id,
      );
    }

    const certificate =
      await this.getWarrantyCertificateFileUseCase.execute(requestId);

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
