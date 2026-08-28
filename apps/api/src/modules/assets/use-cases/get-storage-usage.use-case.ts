import { storageConfig } from '@/config';
import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WARRANTY_CERTIFICATE_FOLDER_SEGMENT } from '@/modules/warranty-certificates/constants/warranty-certificate.constants';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { StorageAlertLevel, StorageUsageSummary } from '@repo/shared';

@Injectable()
export class GetStorageUsageUseCase {
  constructor(
    private readonly uploadAssetService: UploadAssetService,
    private readonly prismaService: PrismaService,
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {}

  async execute(): Promise<StorageUsageSummary> {
    const [publicObjects, privateObjects, tempObjects, certificateRecords] =
      await Promise.all([
        this.uploadAssetService.list('public'),
        this.uploadAssetService.list('private'),
        this.uploadAssetService.list('temp'),
        this.prismaService.warrantyCertificate.findMany({
          where: { storage_key: { not: null } },
          select: { storage_key: true },
        }),
      ]);
    const buckets = {
      private: this.summarize(privateObjects),
      public: this.summarize(publicObjects),
      temp: this.summarize(tempObjects),
    };
    const certificateObjects = privateObjects.filter(({ path }) =>
      path.includes(WARRANTY_CERTIFICATE_FOLDER_SEGMENT),
    );
    const certificateBytes = certificateObjects.reduce(
      (sum, object) => sum + object.size,
      0,
    );
    const referencedCertificatePaths = new Set(
      certificateRecords
        .map(({ storage_key }) => storage_key)
        .filter((path): path is string => Boolean(path)),
    );
    const orphanedCertificateObjects = certificateObjects.filter(
      ({ path }) => !referencedCertificatePaths.has(path),
    );
    const totalBytes =
      buckets.private.bytes + buckets.public.bytes + buckets.temp.bytes;
    const totalObjects =
      buckets.private.objects + buckets.public.objects + buckets.temp.objects;
    const capacityBytes = this.config.capacityBytes;
    const usagePercent = capacityBytes
      ? Math.round((totalBytes / capacityBytes) * 10_000) / 100
      : null;

    return {
      alertLevel: this.getAlertLevel(usagePercent),
      buckets,
      capacityBytes,
      certificates: {
        averageBytes: certificateObjects.length
          ? Math.round(certificateBytes / certificateObjects.length)
          : 0,
        bytes: certificateBytes,
        objects: certificateObjects.length,
        orphanedBytes: orphanedCertificateObjects.reduce(
          (sum, object) => sum + object.size,
          0,
        ),
        orphanedObjects: orphanedCertificateObjects.length,
      },
      totalBytes,
      totalObjects,
      usagePercent,
    };
  }

  private summarize(objects: Array<{ size: number }>) {
    return {
      bytes: objects.reduce((sum, object) => sum + object.size, 0),
      objects: objects.length,
    };
  }

  private getAlertLevel(usagePercent: number | null): StorageAlertLevel {
    if (usagePercent === null) return 'UNCONFIGURED';
    if (usagePercent >= 95) return 'EMERGENCY';
    if (usagePercent >= 85) return 'CRITICAL';
    if (usagePercent >= 70) return 'WARNING';
    return 'NORMAL';
  }
}
