import {
  appConfig,
  bullConfig,
  bullConfigFactory,
  databaseConfig,
  emailConfig,
  jobsConfig,
  jwtConfig,
  rateLimitConfig,
  redisConfig,
} from '@/config';
import { validateEnv } from '@/config/env.validation';
import { WarrantyCertificateEmailStatusModule } from '@/modules/warranty-certificates/modules/warranty-certificate-email-status.module';
import { EmailProcessor } from '@/workers/email/worker.processor';
import { WorkerEmailService } from '@/workers/email/worker.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
      // validate with Zod
      validate: validateEnv, // use Zod to validate and type
      load: [
        appConfig,
        databaseConfig,
        emailConfig,
        jobsConfig,
        jwtConfig,
        rateLimitConfig,
        bullConfig,
        redisConfig,
      ],
    }),
    WarrantyCertificateEmailStatusModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: bullConfigFactory,
    }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [EmailProcessor, WorkerEmailService],
})
export class WorkerModule {}
