import { timeConfig } from '@/config';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { EmailModule } from '@/modules/email/email.module';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { WarrantyCertificateCleanupSchedulerService } from '@/modules/warranty-certificates/services/warranty-certificate-cleanup-scheduler.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import { WarrantyCertificateHtmlTemplateService } from '@/modules/warranty-certificates/services/warranty-certificate-html-template.service';
import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyActivationRequestCertificateEmailService } from '@/modules/warranty-certificates/services/warranty-activation-request-certificate-email.service';
import { CleanupOrphanedWarrantyCertificatesUseCase } from '@/modules/warranty-certificates/use-cases/cleanup-orphaned-warranty-certificates.use-case';
import { DeleteWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/delete-warranty-certificate.use-case';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import { ResendWarrantyActivationRequestCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import { ResendWarrantyCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-certificate-email.use-case';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AssetsModule,
    ConfigModule.forFeature(timeConfig),
    EmailModule,
    PrismaModule,
  ],
  providers: [
    WarrantyCertificatesRepository,
    IssueWarrantyCertificateUseCase,
    IssueWarrantyActivationRequestCertificateUseCase,
    CleanupOrphanedWarrantyCertificatesUseCase,
    DeleteWarrantyCertificateUseCase,
    ResendWarrantyCertificateEmailUseCase,
    WarrantyCertificateCleanupSchedulerService,
    WarrantyCertificateEmailQueueService,
    WarrantyCertificateEmailContentService,
    WarrantyCertificateHtmlTemplateService,
    HtmlPdfRendererService,
    WarrantyCertificatePdfService,
    WarrantyActivationRequestCertificatesRepository,
    WarrantyActivationRequestCertificateEmailService,
    ResendWarrantyActivationRequestCertificateEmailUseCase,
  ],
  exports: [
    WarrantyCertificatesRepository,
    IssueWarrantyCertificateUseCase,
    IssueWarrantyActivationRequestCertificateUseCase,
    WarrantyActivationRequestCertificatesRepository,
    ResendWarrantyActivationRequestCertificateEmailUseCase,
    DeleteWarrantyCertificateUseCase,
    ResendWarrantyCertificateEmailUseCase,
  ],
})
export class WarrantyCertificatesModule {}
