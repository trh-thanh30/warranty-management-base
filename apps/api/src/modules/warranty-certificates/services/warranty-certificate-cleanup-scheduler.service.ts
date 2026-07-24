import { jobsConfig } from '@/config';
import { CleanupOrphanedWarrantyCertificatesUseCase } from '@/modules/warranty-certificates/use-cases/cleanup-orphaned-warranty-certificates.use-case';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class WarrantyCertificateCleanupSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(
    WarrantyCertificateCleanupSchedulerService.name,
  );

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly cleanupUseCase: CleanupOrphanedWarrantyCertificatesUseCase,
    @Inject(jobsConfig.KEY)
    private readonly config: ConfigType<typeof jobsConfig>,
  ) {}

  onModuleInit() {
    if (!this.config.warrantyCertificateCleanup.enabled) return;

    const job = new CronJob(
      this.config.warrantyCertificateCleanup.cron,
      () => void this.run(),
      null,
      false,
      this.config.timezone,
    );
    this.schedulerRegistry.addCronJob('warranty-certificate-cleanup', job);
    job.start();
  }

  async run() {
    try {
      const result = await this.cleanupUseCase.execute({
        dryRun: this.config.warrantyCertificateCleanup.dryRun,
        retentionDays: this.config.warrantyCertificateCleanup.retentionDays,
      });
      this.logger.log(
        `Certificate cleanup completed: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      this.logger.error(
        `Certificate cleanup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
