import { PrismaModule } from '@/database/prisma/prisma.module';
import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';
import { WarrantyCertificateEmailStatusService } from '@/modules/warranty-certificates/services/warranty-certificate-email-status.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [
    WarrantyCertificatesRepository,
    WarrantyCertificateEmailStatusService,
  ],
  exports: [WarrantyCertificateEmailStatusService],
})
export class WarrantyCertificateEmailStatusModule {}
