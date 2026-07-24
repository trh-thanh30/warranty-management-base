import { PrismaService } from '@/database/prisma/prisma.service';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WARRANTY_CERTIFICATE_FOLDER_SEGMENT } from '@/modules/warranty-certificates/warranty-certificate.constants';
import { Injectable, Logger } from '@nestjs/common';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export interface CleanupOrphanedWarrantyCertificatesInput {
  dryRun: boolean;
  retentionDays: number;
  now?: Date;
}

@Injectable()
export class CleanupOrphanedWarrantyCertificatesUseCase {
  private readonly logger = new Logger(
    CleanupOrphanedWarrantyCertificatesUseCase.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadAssetService: UploadAssetService,
  ) {}

  async execute(input: CleanupOrphanedWarrantyCertificatesInput) {
    const now = input.now ?? new Date();
    const cutoff = new Date(
      now.getTime() - input.retentionDays * MILLISECONDS_PER_DAY,
    );
    const [storedObjects, certificateRecords] = await Promise.all([
      this.uploadAssetService.list('private'),
      this.prismaService.warrantyCertificate.findMany({
        where: { storage_key: { not: null } },
        select: { storage_key: true },
      }),
    ]);
    const referencedPaths = new Set(
      certificateRecords
        .map(({ storage_key }) => storage_key)
        .filter((path): path is string => Boolean(path)),
    );
    const certificateObjects = storedObjects.filter(({ path }) =>
      path.includes(WARRANTY_CERTIFICATE_FOLDER_SEGMENT),
    );
    const orphanedObjects = certificateObjects.filter(
      ({ lastModified, path }) =>
        lastModified < cutoff && !referencedPaths.has(path),
    );

    let deleted = 0;
    let failed = 0;
    let reclaimedBytes = 0;

    if (!input.dryRun) {
      for (const object of orphanedObjects) {
        try {
          await this.uploadAssetService.delete(object.path);
          deleted += 1;
          reclaimedBytes += object.size;
          this.logger.log(`Deleted orphaned certificate PDF: ${object.path}`);
        } catch (error) {
          failed += 1;
          this.logger.warn(
            `Could not delete orphaned certificate PDF ${object.path}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    return {
      deleted,
      dryRun: input.dryRun,
      eligible: orphanedObjects.length,
      failed,
      reclaimedBytes,
      scanned: certificateObjects.length,
    };
  }
}
