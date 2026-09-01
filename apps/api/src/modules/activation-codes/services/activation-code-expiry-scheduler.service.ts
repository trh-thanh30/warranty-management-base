import { jobsConfig } from '@/config';
import { ExpireActivationCodesUseCase } from '@/modules/activation-codes/use-cases/expire-activation-codes.use-case';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class ActivationCodeExpirySchedulerService implements OnModuleInit {
  private readonly logger = new Logger(
    ActivationCodeExpirySchedulerService.name,
  );

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly expireUseCase: ExpireActivationCodesUseCase,
    @Inject(jobsConfig.KEY)
    private readonly config: ConfigType<typeof jobsConfig>,
  ) {}

  onModuleInit() {
    if (!this.config.activationCodeExpiry.enabled) return;

    const job = new CronJob(
      this.config.activationCodeExpiry.cron,
      () => void this.run(),
      null,
      false,
      this.config.timezone,
    );
    this.schedulerRegistry.addCronJob('activation-code-expiry', job);
    job.start();
  }

  async run() {
    try {
      const result = await this.expireUseCase.execute({
        batchSize: this.config.activationCodeExpiry.batchSize,
      });
      this.logger.log(
        `Activation code expiry completed: ${JSON.stringify(result)}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Activation code expiry failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { batches: 0, expired: 0 };
    }
  }
}
