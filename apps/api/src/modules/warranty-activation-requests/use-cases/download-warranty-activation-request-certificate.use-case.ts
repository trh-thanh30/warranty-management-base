import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadWarrantyActivationRequestCertificateUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(requestId: string, itemId?: string) {
    if (itemId) {
      const item =
        await this.prismaService.warrantyActivationRequestItem.findFirst({
          where: { id: itemId, request_id: requestId },
          select: {
            warranty: {
              select: {
                certificates: {
                  orderBy: { created_at: 'desc' },
                  select: {
                    certificate_number: true,
                    storage_key: true,
                  },
                  take: 1,
                },
              },
            },
          },
        });

      return this.toCertificateFile(item?.warranty.certificates[0]);
    }

    const request =
      await this.prismaService.warrantyActivationRequest.findUnique({
        where: { id: requestId },
        select: {
          activated_warranty: {
            select: {
              certificates: {
                orderBy: { created_at: 'desc' },
                select: {
                  certificate_number: true,
                  storage_key: true,
                },
                take: 1,
              },
            },
          },
        },
      });

    return this.toCertificateFile(request?.activated_warranty?.certificates[0]);
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
