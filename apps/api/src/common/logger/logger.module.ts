// src/logger/logger.module.ts  (Dynamic Module forFeature)
import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import type { Logger as WinstonLogger } from 'winston';
import {
  LoggerCoreModule,
  BASE_LOGGER,
} from '@/common/logger/logger.core.module';
import { CONTEXT_LOGGER_TOKEN } from '@/common/logger/logger.token';
import { LoggerService } from '@/common/logger/logger.service';

@Global()
@Module({})
export class LoggerModule {
  static forFeature(contexts: string[]): DynamicModule {
    const providers: Provider[] = contexts.map((ctx) => ({
      provide: CONTEXT_LOGGER_TOKEN(ctx),
      useFactory: (base: WinstonLogger) => new LoggerService(base, ctx),
      inject: [BASE_LOGGER],
    }));

    return {
      module: LoggerModule,
      imports: [LoggerCoreModule],
      providers,
      exports: providers,
    };
  }
}
