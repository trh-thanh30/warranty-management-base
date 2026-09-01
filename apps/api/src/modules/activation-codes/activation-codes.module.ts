import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ActivationCodesController } from '@/modules/activation-codes/activation-codes.controller';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { CreateActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/create-activation-code-batch.use-case';
import { GenerateActivationCodeUseCase } from '@/modules/activation-codes/use-cases/generate-activation-code.use-case';
import { SystemConfigModule } from '@/modules/system-config/system-config.module';
import { ProductsModule } from '@/modules/products/products.module';
import { RevokeActivationCodeUseCase } from '@/modules/activation-codes/use-cases/revoke-activation-code.use-case';
import { RequestActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/request-activation-label-print-job.use-case';
import { GetActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/get-activation-label-print-job.use-case';
import { DownloadActivationLabelPrintJobUseCase } from '@/modules/activation-codes/use-cases/download-activation-label-print-job.use-case';
import { ExpireActivationCodesUseCase } from '@/modules/activation-codes/use-cases/expire-activation-codes.use-case';
import { GetActivationCodeReportUseCase } from '@/modules/activation-codes/use-cases/get-activation-code-report.use-case';
import { ExportActivationCodeReportUseCase } from '@/modules/activation-codes/use-cases/export-activation-code-report.use-case';
import { ActivationCodePrintJobsRepository } from '@/modules/activation-codes/repository/activation-code-print-jobs.repository';
import { ActivationLabelPrintQueueService } from '@/modules/activation-codes/services/activation-label-print-queue.service';
import { ActivationCodeExpirySchedulerService } from '@/modules/activation-codes/services/activation-code-expiry-scheduler.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    AssetsModule,
    BullModule.registerQueue({ name: 'activation-label-print' }),
    ProductsModule,
    SystemConfigModule,
  ],
  controllers: [ActivationCodesController],
  providers: [
    ActivationCodeBatchesRepository,
    ActivationCodeCryptoService,
    GenerateActivationCodeUseCase,
    CreateActivationCodeBatchUseCase,
    RevokeActivationCodeUseCase,
    ActivationCodePrintJobsRepository,
    ActivationLabelPrintQueueService,
    RequestActivationLabelPrintJobUseCase,
    GetActivationLabelPrintJobUseCase,
    DownloadActivationLabelPrintJobUseCase,
    ExpireActivationCodesUseCase,
    ActivationCodeExpirySchedulerService,
    GetActivationCodeReportUseCase,
    ExportActivationCodeReportUseCase,
  ],
  exports: [ActivationCodeBatchesRepository, ActivationCodeCryptoService],
})
export class ActivationCodesModule {}
