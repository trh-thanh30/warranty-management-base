import { timeConfig } from '@/config';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WARRANTY_CERTIFICATE_FOLDER_SEGMENT } from '@/modules/warranty-certificates/warranty-certificate.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

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
    private readonly warrantyCertificatesRepository: WarrantyCertificatesRepository,
    private readonly uploadAssetService: UploadAssetService,
    @Inject(timeConfig.KEY)
    private readonly config: ConfigType<typeof timeConfig>,
  ) {}

  async execute(input: CleanupOrphanedWarrantyCertificatesInput) {
    const now = input.now ?? new Date();
    const cutoff = new Date(
      now.getTime() - input.retentionDays * this.config.millisecondsPerDay,
    );
    const [storedObjects, certificateRecords] = await Promise.all([
      this.uploadAssetService.list('private'),
      this.warrantyCertificatesRepository.findStoredPaths(),
    ]);
    const referencedPaths = new Set(
      certificateRecords
        .map(({ storageKey }) => storageKey)
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
