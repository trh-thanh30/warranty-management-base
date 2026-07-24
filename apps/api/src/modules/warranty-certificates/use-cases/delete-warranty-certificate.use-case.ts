import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteWarrantyCertificateUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(certificateId: string) {
    const certificate = await this.prismaService.warrantyCertificate.findUnique(
      {
        where: { id: certificateId },
        select: { id: true, storage_key: true },
      },
    );

    if (!certificate) {
      throw new NotFoundException('Warranty certificate not found');
    }

    if (certificate.storage_key) {
      await this.uploadAssetService.delete(certificate.storage_key);
    }

    return this.prismaService.warrantyCertificate.delete({
      where: { id: certificate.id },
    });
  }
}
