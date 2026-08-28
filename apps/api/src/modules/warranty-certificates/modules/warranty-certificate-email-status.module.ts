import { PrismaModule } from '@/database/prisma/prisma.module';
import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailStatusService } from '@/modules/warranty-certificates/services/warranty-certificate-email-status.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [
    WarrantyActivationRequestCertificatesRepository,
    WarrantyCertificatesRepository,
    WarrantyCertificateEmailStatusService,
  ],
  exports: [WarrantyCertificateEmailStatusService],
})
export class WarrantyCertificateEmailStatusModule {}
