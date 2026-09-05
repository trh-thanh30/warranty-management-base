import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { activation_code_print_job_status } from '@prisma/client';

@Injectable()
export class ActivationCodePrintJobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.activationCodePrintJob.findUnique({
      where: { id },
      include: { batch: true },
    });
  }

  findByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.activationCodePrintJob.findUnique({
      where: { idempotency_key: idempotencyKey },
      include: { batch: true },
    });
  }

  create(input: {
    batchId: string;
    from: number;
    idempotencyKey: string;
    labelHeightMm: number;
    labelWidthMm: number;
    requestedById: string;
    to: number;
  }) {
    return this.prisma.activationCodePrintJob.create({
      data: {
        batch: { connect: { id: input.batchId } },
        requested_by: { connect: { id: input.requestedById } },
        idempotency_key: input.idempotencyKey,
        from_index: input.from,
        label_height_mm: input.labelHeightMm,
        label_width_mm: input.labelWidthMm,
        to_index: input.to,
      },
      include: { batch: true },
    });
  }

  markQueued(id: string, bullJobId: string) {
    return this.prisma.activationCodePrintJob.update({
      where: { id },
      data: {
        bull_job_id: bullJobId,
        progress_percent: 0,
        status: activation_code_print_job_status.QUEUED,
        error_message: null,
      },
    });
  }

  markProcessing(id: string, attempts: number) {
    return this.prisma.activationCodePrintJob.update({
      where: { id },
      data: {
        attempts,
        progress_percent: 10,
        started_at: new Date(),
        status: activation_code_print_job_status.PROCESSING,
        error_message: null,
      },
    });
  }

  markProgress(id: string, progressPercent: number) {
    return this.prisma.activationCodePrintJob.update({
      where: { id },
      data: { progress_percent: Math.max(0, Math.min(100, progressPercent)) },
    });
  }

  markCompleted(id: string, input: { filename: string; storageKey: string }) {
    return this.prisma.activationCodePrintJob.update({
      where: { id },
      data: {
        completed_at: new Date(),
        error_message: null,
        filename: input.filename,
        progress_percent: 100,
        status: activation_code_print_job_status.COMPLETED,
        storage_key: input.storageKey,
      },
    });
  }

  markFailed(id: string, errorMessage: string, attempts: number) {
    return this.prisma.activationCodePrintJob.update({
      where: { id },
      data: {
        attempts,
        error_message: errorMessage.slice(0, 2000),
        status: activation_code_print_job_status.FAILED,
      },
    });
  }
}
