import {
  activationCodeConfig,
  bullConfig,
  bullConfigFactory,
  databaseConfig,
  emailConfig,
  jobsConfig,
  jwtConfig,
  pdfRendererConfig,
  redisConfig,
  storageConfig,
  timeConfig,
} from '@/config';
import { validateEnv } from '@/config/env.validation';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodePrintJobsRepository } from '@/modules/activation-codes/repository/activation-code-print-jobs.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { ActivationLabelTemplateService } from '@/modules/activation-codes/services/activation-label-template.service';
import { CreatePrintableActivationLabelsUseCase } from '@/modules/activation-codes/use-cases/create-printable-activation-labels.use-case';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/modules/warranty-certificates.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ActivationLabelPrintProcessor } from '@/workers/activation-label-print/worker.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
      validate: validateEnv,
      load: [
        activationCodeConfig,
        bullConfig,
        databaseConfig,
        emailConfig,
        jobsConfig,
        jwtConfig,
        pdfRendererConfig,
        redisConfig,
        storageConfig,
        timeConfig,
      ],
    }),
    ConfigModule.forFeature(activationCodeConfig),
    ScheduleModule.forRoot(),
    PrismaModule,
    AssetsModule,
    WarrantyCertificatesModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: bullConfigFactory,
    }),
    BullModule.registerQueue({ name: 'activation-label-print' }),
  ],
  providers: [
    ActivationCodeBatchesRepository,
    ActivationCodePrintJobsRepository,
    ActivationCodeCryptoService,
    ActivationLabelTemplateService,
    CreatePrintableActivationLabelsUseCase,
    ActivationLabelPrintProcessor,
  ],
})
export class ActivationLabelPrintWorkerModule {}
