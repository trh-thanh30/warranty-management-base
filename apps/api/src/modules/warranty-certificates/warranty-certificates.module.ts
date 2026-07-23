import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { EmailModule } from '@/modules/email/email.module';
import { IssueWarrantyCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, EmailModule, PrismaModule],
  providers: [IssueWarrantyCertificateUseCase],
  exports: [IssueWarrantyCertificateUseCase],
})
export class WarrantyCertificatesModule {}
