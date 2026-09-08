import { activationCodeConfig } from '@/config';
import {
  ACTIVATION_LABEL_PRINT_JOB,
  ACTIVATION_LABEL_PRINT_QUEUE,
  ActivationLabelPrintJobData,
} from '@/modules/activation-codes/activation-code-jobs.types';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { RateLimitError } from '@/common/response';
import type { ConfigType } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class ActivationLabelPrintQueueService {
  constructor(
    @InjectQueue(ACTIVATION_LABEL_PRINT_QUEUE)
    private readonly queue: Queue<ActivationLabelPrintJobData>,
    @Inject(activationCodeConfig.KEY)
    private readonly config: ConfigType<typeof activationCodeConfig>,
  ) {}

  async enqueue(printJobId: string, options: { replaceFailed?: boolean } = {}) {
    const existing = await this.queue.getJob(printJobId);
    if (existing) {
      if (options.replaceFailed) {
        const state = await existing.getState();
        if (state === 'failed') {
          await existing.remove();
        } else {
          return existing;
        }
      } else {
        return existing;
      }
    }

    const waiting = await this.queue.getWaitingCount();
    if (waiting >= this.config.printQueueSize) {
      throw new RateLimitError(
        'Activation label print queue is currently full',
        'ACTIVATION_LABEL_QUEUE_FULL',
      );
    }
    return this.queue.add(
      ACTIVATION_LABEL_PRINT_JOB,
      { printJobId },
      {
        jobId: printJobId,
        attempts: this.config.printAttempts,
        backoff: {
          type: 'exponential',
          delay: this.config.printBackoffMs,
        },
        removeOnComplete: {
          age: this.config.printCompletedRetentionSeconds,
        },
        removeOnFail: { age: this.config.printFailedRetentionSeconds },
      },
    );
  }
}
