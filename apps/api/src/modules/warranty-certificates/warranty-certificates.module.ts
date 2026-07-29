import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { EmailModule } from '@/modules/email/email.module';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { WarrantyCertificateCleanupSchedulerService } from '@/modules/warranty-certificates/services/warranty-certificate-cleanup-scheduler.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import { CleanupOrphanedWarrantyCertificatesUseCase } from '@/modules/warranty-certificates/use-cases/cleanup-orphaned-warranty-certificates.use-case';
import { DeleteWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/delete-warranty-certificate.use-case';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { ResendWarrantyCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-certificate-email.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, EmailModule, PrismaModule],
  providers: [
    IssueWarrantyCertificateUseCase,
    CleanupOrphanedWarrantyCertificatesUseCase,
    DeleteWarrantyCertificateUseCase,
    ResendWarrantyCertificateEmailUseCase,
    WarrantyCertificateCleanupSchedulerService,
    WarrantyCertificateEmailQueueService,
    WarrantyCertificateEmailContentService,
    WarrantyCertificatePdfService,
  ],
  exports: [
    IssueWarrantyCertificateUseCase,
    DeleteWarrantyCertificateUseCase,
    ResendWarrantyCertificateEmailUseCase,
  ],
})
export class WarrantyCertificatesModule {}
