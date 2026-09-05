import { BadRequestError, NotFoundError } from '@/common/response';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodePrintJobsRepository } from '@/modules/activation-codes/repository/activation-code-print-jobs.repository';
import { ActivationLabelPrintQueueService } from '@/modules/activation-codes/services/activation-label-print-queue.service';
import { Injectable } from '@nestjs/common';
import {
  DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
  DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
} from '@repo/shared/constants';
import { isActivationLabelSizeValid } from '@repo/shared/utils';

@Injectable()
export class RequestActivationLabelPrintJobUseCase {
  constructor(
    private readonly batches: ActivationCodeBatchesRepository,
    private readonly jobs: ActivationCodePrintJobsRepository,
    private readonly queue: ActivationLabelPrintQueueService,
  ) {}

  async execute(input: {
    batchId: string;
    from?: number;
    labelHeightMm?: number;
    labelWidthMm?: number;
    requestedById: string;
    to?: number;
  }) {
    const batch = await this.batches.findWithCodes(input.batchId);
    if (!batch) throw new NotFoundError('Activation code batch not found');

    const from = input.from ?? 1;
    const to = input.to ?? batch.codes.length;
    const labelHeightMm =
      input.labelHeightMm ?? DEFAULT_ACTIVATION_LABEL_HEIGHT_MM;
    const labelWidthMm =
      input.labelWidthMm ?? DEFAULT_ACTIVATION_LABEL_WIDTH_MM;
    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 1 ||
      to < from ||
      to > 1000
    ) {
      throw new BadRequestError(
        'Printable label range is invalid',
        'ACTIVATION_LABEL_RANGE_INVALID',
      );
    }
    if (from > batch.codes.length) {
      throw new NotFoundError('No activation codes to print');
    }
    if (isActivationLabelSizeValid({ labelHeightMm, labelWidthMm }) === false) {
      throw new BadRequestError(
        'Activation label size is invalid',
        'ACTIVATION_LABEL_SIZE_INVALID',
      );
    }

    const boundedTo = Math.min(to, batch.codes.length);
    const idempotencyKey = `activation-labels-${input.batchId}-${from}-${boundedTo}-${labelWidthMm}x${labelHeightMm}`;
    const existing = await this.jobs.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      if (existing.status === 'COMPLETED') return existing;

      if (existing.status !== 'FAILED') {
        await this.queue.enqueue(existing.id);
        return existing;
      }

      const bullJob = await this.queue.enqueue(existing.id, {
        replaceFailed: true,
      });
      return this.jobs.markQueued(existing.id, bullJob.id ?? existing.id);
    }

    let job;
    try {
      job = await this.jobs.create({
        batchId: input.batchId,
        from,
        idempotencyKey,
        labelHeightMm,
        labelWidthMm,
        requestedById: input.requestedById,
        to: boundedTo,
      });
    } catch (error) {
      const concurrent = await this.jobs.findByIdempotencyKey(idempotencyKey);
      if (concurrent) return concurrent;
      throw error;
    }

    try {
      const bullJob = await this.queue.enqueue(job.id);
      return await this.jobs.markQueued(job.id, bullJob.id ?? job.id);
    } catch (error) {
      await this.jobs.markFailed(
        job.id,
        error instanceof Error ? error.message : String(error),
        0,
      );
      throw error;
    }
  }
}
