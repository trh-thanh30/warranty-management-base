import { WarrantyCertificateBatchEmailService } from '@/modules/warranty-certificates/services/warranty-certificate-batch-email.service';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class IssueWarrantyCertificatesForRequestUseCase {
  private readonly logger = new Logger(
    IssueWarrantyCertificatesForRequestUseCase.name,
  );

  constructor(
    private readonly issueWarrantyCertificateUseCase: IssueWarrantyCertificateUseCase,
    private readonly batchEmailService: WarrantyCertificateBatchEmailService,
  ) {}

  async execute(input: {
    recipientEmail?: string;
    requestId: string;
    warrantyIds: string[];
  }) {
    const certificateIds: string[] = [];
    const failures: Array<{ message: string; warrantyId: string }> = [];

    for (const warrantyId of [...new Set(input.warrantyIds)]) {
      try {
        const certificate = await this.issueWarrantyCertificateUseCase.execute({
          queueEmail: false,
          recipientEmail: input.recipientEmail,
          requestId: input.requestId,
          warrantyId,
        });
        certificateIds.push(certificate.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown certificate error';
        failures.push({ message, warrantyId });
        this.logger.error(
          `Failed to issue certificate for warranty ${warrantyId}: ${message}`,
        );
      }
    }

    if (input.recipientEmail && certificateIds.length > 0) {
      try {
        await this.batchEmailService.queueEmail({
          certificateIds,
          recipientEmail: input.recipientEmail,
          requestId: input.requestId,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown batch email error';
        this.logger.error(
          `Failed to queue certificate email for request ${input.requestId}: ${message}`,
        );
        return { certificateIds, emailFailure: message, failures };
      }
    }

    return { certificateIds, failures };
  }
}
