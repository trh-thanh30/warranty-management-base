import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { warranty_certificate_email_status } from '@prisma/client';
import { Job } from 'bullmq';
import { WorkerEmailService } from '@/workers/email/worker.service';

export interface EmailJobData {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    contentBase64: string;
    contentType: string;
    filename: string;
  }>;
  template?: string;
  context?: Record<string, unknown>;
  warrantyCertificateId?: string;
  // Idempotency key for deduplication
  idempotencyKey?: string;
}

@Injectable()
@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly processedJobs = new Set<string>();

  constructor(
    private readonly emailService: WorkerEmailService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const {
      to,
      subject,
      text,
      html,
      attachments,
      template,
      context,
      idempotencyKey,
      warrantyCertificateId,
    } = job.data;

    // Idempotency check - skip if already processed
    if (idempotencyKey && this.processedJobs.has(idempotencyKey)) {
      this.logger.log(
        `Skipping duplicate job ${job.id} with idempotency key: ${idempotencyKey}`,
      );
      return;
    }

    try {
      this.logger.log(`Processing email job ${job.id} to ${to}`);

      // send progress
      job.updateProgress(50);

      if (template && context) {
        // Send templated email
        await this.emailService.sendTemplatedEmail(to, template, context, {
          attachments,
          subject,
          text,
        });
      } else {
        // Send regular email
        await this.emailService.sendEmail(
          to,
          subject || 'No Subject',
          text || '',
          html,
          attachments,
        );
      }

      // Mark as processed for idempotency
      if (idempotencyKey) {
        this.processedJobs.add(idempotencyKey);
        // Clean up old processed jobs to prevent memory leak
        if (this.processedJobs.size > 10000) {
          // Keep only recent 5000 jobs
          const recentJobs = Array.from(this.processedJobs).slice(-5000);
          this.processedJobs.clear();
          recentJobs.forEach((key) => this.processedJobs.add(key));
        }
      }

      // mark job as completed
      job.updateProgress(100);
      await this.markWarrantyCertificateEmailSent(warrantyCertificateId);

      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      await this.markWarrantyCertificateEmailFailed(
        warrantyCertificateId,
        error instanceof Error ? error.message : 'Unknown email sending error',
      );
      this.logger.error(`Email job ${job.id} failed: ${error.message}`);
      throw error; // Re-throw to mark job as failed
    }
  }

  private async markWarrantyCertificateEmailSent(certificateId?: string) {
    if (!certificateId) return;

    await this.prismaService.warrantyCertificate.update({
      where: { id: certificateId },
      data: {
        email_status: warranty_certificate_email_status.SENT,
        emailed_at: new Date(),
        last_error: null,
      },
    });
  }

  private async markWarrantyCertificateEmailFailed(
    certificateId: string | undefined,
    message: string,
  ) {
    if (!certificateId) return;

    await this.prismaService.warrantyCertificate.update({
      where: { id: certificateId },
      data: {
        email_status: warranty_certificate_email_status.FAILED,
        last_error: message,
      },
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJobData>) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJobData>, err: Error) {
    this.logger.error(`Email job ${job.id} failed: ${err.message}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<EmailJobData>) {
    this.logger.log(`Email job ${job.id} started processing`);
  }
}
