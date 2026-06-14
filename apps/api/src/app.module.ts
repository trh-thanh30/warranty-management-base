import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@sentry/nestjs/setup';
import { join } from 'node:path';

// config
import {
  appConfig,
  bullConfig,
  bullConfigFactory,
  clientConfig,
  cookieConfig,
  databaseConfig,
  emailConfig,
  jobsConfig,
  jwtConfig,
  rateLimitConfig,
  redisConfig,
  storageConfig,
  telegramConfig,
  validateEnv,
} from '@/config';

// common
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpLogInterceptor } from '@/common/interceptors/http-logger.interceptor';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { LoggerCoreModule, LoggerModule } from '@/common/logger';

// modules
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '@/common/guards/optional-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { IdentityMiddleware } from '@/common/middleware/identity.middleware';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { RedisModule } from '@/database/redis/redis.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommonModule } from '@/modules/common/common.module';
import { EmailModule } from '@/modules/email/email.module';
import { HealthModule } from '@/modules/health/health.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { UsersModule } from '@/modules/user/user.module';
import { VerificationModule } from '@/modules/verification/verification.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

const rootDir = join(__dirname, '..', '..', '..');
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
const envPath = join(rootDir, envFile);

@Module({
  imports: [
    SentryModule.forRoot(),
    // config
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [envPath],
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        emailConfig,
        jobsConfig,
        jwtConfig,
        rateLimitConfig,
        bullConfig,
        redisConfig,
        storageConfig,
        cookieConfig,
        clientConfig,
        telegramConfig,
      ],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: bullConfigFactory,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const throttlerConfig = config.get<{ ttl: number; limit: number }>(
          'throttler',
        );
        return [
          {
            ttl: (throttlerConfig?.ttl ?? 60) * 1000,
            limit: throttlerConfig?.limit ?? 10,
          },
        ];
      },
    }),
    LoggerCoreModule,
    LoggerModule.forFeature(['HTTP', 'DATABASE', 'APP', 'EMAIL']),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const storageRootDir =
          config.get<string>('storage.rootDir') ?? '/app/storage';
        const publicDirName =
          config.get<string>('storage.publicDirName') ?? 'public';

        return [
          {
            rootPath: join(storageRootDir, publicDirName),
            serveRoot: '/cdn',
            renderPath: '__cdn_disabled_spa_fallback__',
            serveStaticOptions: {
              index: false,
            },
          },
        ];
      },
    }),
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    ScheduleModule.forRoot(),
    JobsModule,
    HealthModule,
    AssetsModule,
    CommonModule,
    NotificationModule,
    UsersModule,
    VerificationModule,
  ],
  providers: [
    HttpLogInterceptor,
    ResponseInterceptor,
    AllExceptionsFilter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OptionalAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes('*');
  }
}
