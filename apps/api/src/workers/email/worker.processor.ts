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
      attachments,
      context,
      html,
      idempotencyKey,
      subject,
      template,
      text,
      to,
      warrantyActivationRequestCertificateId,
      warrantyCertificateId,
      warrantyCertificateIds,
    } = job.data;
    const certificateIds =
      warrantyCertificateIds ??
      (warrantyCertificateId ? [warrantyCertificateId] : []);

    if (idempotencyKey && this.processedJobs.has(idempotencyKey)) {
      this.logger.log(
        `Skipping duplicate job ${job.id} with idempotency key: ${idempotencyKey}`,
      );
      return;
    }

    try {
      this.logger.log(`Processing email job ${job.id} to ${to}`);
      job.updateProgress(50);

      if (template && context) {
        await this.emailService.sendTemplatedEmail(to, template, context, {
          attachments,
          subject,
          text,
        });
      } else {
        await this.emailService.sendEmail(
          to,
          subject || 'No Subject',
          text || '',
          html,
          attachments,
        );
      }

      job.updateProgress(100);
      await Promise.all([
        this.warrantyCertificateEmailStatusService.markSent(certificateIds),
        this.warrantyCertificateEmailStatusService.markRequestSent(
          warrantyActivationRequestCertificateId,
        ),
      ]);

      if (idempotencyKey) {
        this.processedJobs.add(idempotencyKey);
        if (this.processedJobs.size > 10000) {
          const recentJobs = Array.from(this.processedJobs).slice(-5000);
          this.processedJobs.clear();
          recentJobs.forEach((key) => this.processedJobs.add(key));
        }
      }

      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email sending error';
      await Promise.all([
        this.warrantyCertificateEmailStatusService.markFailed(
          certificateIds,
          message,
        ),
        this.warrantyCertificateEmailStatusService.markRequestFailed(
          warrantyActivationRequestCertificateId,
          message,
        ),
      ]);
      this.logger.error(`Email job ${job.id} failed: ${message}`);
      throw error;
    }
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
