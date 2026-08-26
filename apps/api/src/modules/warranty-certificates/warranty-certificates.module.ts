import { timeConfig } from '@/config';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { EmailModule } from '@/modules/email/email.module';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificateBatchEmailService } from '@/modules/warranty-certificates/services/warranty-certificate-batch-email.service';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { WarrantyCertificateCleanupSchedulerService } from '@/modules/warranty-certificates/services/warranty-certificate-cleanup-scheduler.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import { CleanupOrphanedWarrantyCertificatesUseCase } from '@/modules/warranty-certificates/use-cases/cleanup-orphaned-warranty-certificates.use-case';
import { DeleteWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/delete-warranty-certificate.use-case';
import { GetWarrantyCertificateFileForActivationRequestUseCase } from '@/modules/warranty-certificates/use-cases/get-warranty-certificate-file-for-activation-request.use-case';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { IssueWarrantyCertificatesForRequestUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificates-for-request.use-case';
import { ResendWarrantyCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-certificate-email.use-case';
import { WarrantyCertificateEmailStatusModule } from '@/modules/warranty-certificates/warranty-certificate-email-status.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AssetsModule,
    ConfigModule.forFeature(timeConfig),
    EmailModule,
    PrismaModule,
    WarrantyCertificateEmailStatusModule,
  ],
  providers: [
    WarrantyCertificatesRepository,
    IssueWarrantyCertificateUseCase,
    IssueWarrantyCertificatesForRequestUseCase,
    CleanupOrphanedWarrantyCertificatesUseCase,
    DeleteWarrantyCertificateUseCase,
    GetWarrantyCertificateFileForActivationRequestUseCase,
    ResendWarrantyCertificateEmailUseCase,
    WarrantyCertificateCleanupSchedulerService,
    WarrantyCertificateEmailQueueService,
    WarrantyCertificateBatchEmailService,
    WarrantyCertificateEmailContentService,
    WarrantyCertificatePdfService,
  ],
  exports: [
    IssueWarrantyCertificateUseCase,
    IssueWarrantyCertificatesForRequestUseCase,
    DeleteWarrantyCertificateUseCase,
    GetWarrantyCertificateFileForActivationRequestUseCase,
    ResendWarrantyCertificateEmailUseCase,
    WarrantyCertificateEmailStatusModule,
  ],
})
export class WarrantyCertificatesModule {}
