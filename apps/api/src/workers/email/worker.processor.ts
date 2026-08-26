import { WarrantyCertificateEmailStatusService } from '@/modules/warranty-certificates/services/warranty-certificate-email-status.service';
import { EmailJobData } from '@/workers/email/types/email-worker.type';
import { WorkerEmailService } from '@/workers/email/worker.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly processedJobs = new Set<string>();

  constructor(
    private readonly emailService: WorkerEmailService,
    private readonly warrantyCertificateEmailStatusService: WarrantyCertificateEmailStatusService,
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
      warrantyCertificateIds,
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
      await this.markWarrantyCertificateEmailSent(
        warrantyCertificateIds ??
          (warrantyCertificateId ? [warrantyCertificateId] : []),
      );

      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email sending error';
      await this.markWarrantyCertificateEmailFailed(
        warrantyCertificateIds ??
          (warrantyCertificateId ? [warrantyCertificateId] : []),
        message,
      );
      this.logger.error(`Email job ${job.id} failed: ${message}`);
      throw error; // Re-throw to mark job as failed
    }
  }

  private async markWarrantyCertificateEmailSent(certificateIds: string[]) {
    if (certificateIds.length === 0) return;

    await this.warrantyCertificateEmailStatusService.markSent(certificateIds);
  }

  private async markWarrantyCertificateEmailFailed(
    certificateIds: string[],
    message: string,
  ) {
    if (certificateIds.length === 0) return;

    await this.warrantyCertificateEmailStatusService.markFailed(
      certificateIds,
      message,
    );
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
