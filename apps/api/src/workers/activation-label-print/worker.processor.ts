import {
  ACTIVATION_LABEL_PRINT_QUEUE,
  ActivationLabelPrintJobData,
} from '@/modules/activation-codes/activation-code-jobs.types';
import { ActivationCodePrintJobsRepository } from '@/modules/activation-codes/repository/activation-code-print-jobs.repository';
import { getActivationCodePrintConcurrency } from '@/config/activation-code.config';
import { CreatePrintableActivationLabelsUseCase } from '@/modules/activation-codes/use-cases/create-printable-activation-labels.use-case';
import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';
import { ASSET_ACCESS_TYPE } from '@/modules/assets/types/assets.types';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Readable } from 'node:stream';

@Injectable()
@Processor(ACTIVATION_LABEL_PRINT_QUEUE, {
  concurrency: getActivationCodePrintConcurrency(),
})
export class ActivationLabelPrintProcessor extends WorkerHost {
  private readonly logger = new Logger(ActivationLabelPrintProcessor.name);

  constructor(
    private readonly jobs: ActivationCodePrintJobsRepository,
    private readonly renderer: CreatePrintableActivationLabelsUseCase,
    private readonly assets: UploadAssetService,
  ) {
    super();
  }

  async process(job: Job<ActivationLabelPrintJobData>): Promise<void> {
    const printJob = await this.jobs.findById(job.data.printJobId);
    if (!printJob) return;

    await this.jobs.markProcessing(printJob.id, job.attemptsMade + 1);
    try {
      const result = await this.renderer.execute(printJob.batch_id, {
        from: printJob.from_index,
        to: printJob.to_index,
      });
      const uploaded = await this.assets.upload(
        {
          buffer: result.pdf,
          destination: '',
          encoding: '7bit',
          fieldname: 'file',
          filename: result.filename,
          mimetype: 'application/pdf',
          originalname: result.filename,
          path: '',
          size: result.pdf.byteLength,
          stream: Readable.from(result.pdf),
        },
        {
          accessType: ASSET_ACCESS_TYPE.PRIVATE,
          folder: 'activation-labels',
        },
      );
      await this.jobs.markCompleted(printJob.id, {
        filename: result.filename,
        storageKey: uploaded.path,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const finalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      if (finalAttempt)
        await this.jobs.markFailed(printJob.id, message, job.attemptsMade + 1);
      this.logger.error(`Print job ${printJob.id} failed: ${message}`);
      throw error;
    }
  }
}
