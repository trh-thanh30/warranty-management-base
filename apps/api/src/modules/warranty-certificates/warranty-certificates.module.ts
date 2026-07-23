import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { EmailModule } from '@/modules/email/email.module';
import { WarrantyCertificateEmailQueueService } from '@/modules/warranty-certificates/services/warranty-certificate-email-queue.service';
import { WarrantyCertificateEmailContentService } from '@/modules/warranty-certificates/services/warranty-certificate-email-content.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { ResendWarrantyCertificateEmailUseCase } from '@/modules/warranty-certificates/use-cases/resend-warranty-certificate-email.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, EmailModule, PrismaModule],
  providers: [
    IssueWarrantyCertificateUseCase,
    ResendWarrantyCertificateEmailUseCase,
    WarrantyCertificateEmailQueueService,
    WarrantyCertificateEmailContentService,
    WarrantyCertificatePdfService,
  ],
  exports: [
    IssueWarrantyCertificateUseCase,
    ResendWarrantyCertificateEmailUseCase,
  ],
})
export class WarrantyCertificatesModule {}
