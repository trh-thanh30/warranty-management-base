import { jobsConfig } from '@/config';
import { GetStorageUsageUseCase } from '@/modules/assets/use-cases/get-storage-usage.use-case';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class StorageUsageMonitorSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(
    StorageUsageMonitorSchedulerService.name,
  );

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly getStorageUsageUseCase: GetStorageUsageUseCase,
    @Inject(jobsConfig.KEY)
    private readonly config: ConfigType<typeof jobsConfig>,
  ) {}

  onModuleInit() {
    if (!this.config.storageUsageMonitor.enabled) return;

    const job = new CronJob(
      this.config.storageUsageMonitor.cron,
      () => void this.run(),
      null,
      false,
      this.config.timezone,
    );
    this.schedulerRegistry.addCronJob('storage-usage-monitor', job);
    job.start();
  }

  async run() {
    try {
      const usage = await this.getStorageUsageUseCase.execute();
      const message = `Storage usage: ${JSON.stringify(usage)}`;

      if (usage.alertLevel === 'EMERGENCY') {
        this.logger.error(message);
      } else if (
        usage.alertLevel === 'CRITICAL' ||
        usage.alertLevel === 'WARNING'
      ) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    } catch (error) {
      this.logger.error(
        `Storage usage monitoring failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
