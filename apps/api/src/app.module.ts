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
  vietnamProvincesConfig,
} from '@/config';

// common
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpLogInterceptor } from '@/common/interceptors/http-logger.interceptor';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { LoggerCoreModule, LoggerModule } from '@/common/logger';

// modules
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '@/common/guards/optional-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { IdentityMiddleware } from '@/common/middleware/identity.middleware';
import { PermissionsModule } from '@/common/permissions/permissions.module';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { RedisModule } from '@/database/redis/redis.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommonModule } from '@/modules/common/common.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { ContentPagesModule } from '@/modules/content-pages/content-pages.module';
import { CustomersModule } from '@/modules/customers/customers.module';
import { EmailModule } from '@/modules/email/email.module';
import { HealthModule } from '@/modules/health/health.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { LocationsModule } from '@/modules/locations/locations.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { ProductsModule } from '@/modules/products/products.module';
import { PublicModule } from '@/modules/public/public.module';
import { ServiceCentersModule } from '@/modules/service-centers/service-centers.module';
import { UsersModule } from '@/modules/user/user.module';
import { VerificationModule } from '@/modules/verification/verification.module';
import { WarrantyActivationRequestsModule } from '@/modules/warranty-activation-requests/warranty-activation-requests.module';
import { WarrantyClaimsModule } from '@/modules/warranty-claims/warranty-claims.module';
import { WarrantiesModule } from '@/modules/warranties/warranties.module';
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
        vietnamProvincesConfig,
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
    PermissionsModule,
    RedisModule,
    EmailModule,
    AuthModule,
    ScheduleModule.forRoot(),
    JobsModule,
    HealthModule,
    AnalyticsModule,
    AssetsModule,
    CommonModule,
    CategoriesModule,
    ContentPagesModule,
    NotificationModule,
    CustomersModule,
    LocationsModule,
    ProductsModule,
    WarrantiesModule,
    WarrantyActivationRequestsModule,
    ServiceCentersModule,
    WarrantyClaimsModule,
    PublicModule,
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
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdentityMiddleware).forRoutes('*');
  }
}
