import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import './instrument';
import { loadEnv } from '@/load-env';

// Load environment variables and log which file was used
const loadedEnvPath = loadEnv() ?? '(none found)';
console.log(`📋 [ENV] Loaded environment from: ${loadedEnvPath}`);

// core
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

// app
import { AppModule } from '@/app.module';
import { appConfig } from '@/config';

// common
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpLogInterceptor } from '@/common/interceptors/http-logger.interceptor';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

// external
import cookieParser from 'cookie-parser';

// bootstrap the application
async function bootstrap() {
  // Ensure logs directory exists
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
      rawBody: true,
    });
    app.enableShutdownHooks();

    // Get app config
    const appCfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

    // Set cookie parser
    app.use(cookieParser());

    // Set global prefix for the api
    app.setGlobalPrefix('api/v1', {
      exclude: [
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/*path', method: RequestMethod.ALL },
      ],
    });

    // Enable CORS
    const origins =
      process.env.CORS_ORIGINS?.split(',').map((o) =>
        o.trim().replace(/\/$/, ''),
      ) || '*';
    app.enableCors({
      origin: origins,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: [
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Auth-Context',
        'X-Requested-With',
        'apollo-require-preflight',
      ],
    });

    // Apply global pipes, interceptors, and filters
    app.useGlobalInterceptors(app.get(HttpLogInterceptor));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalInterceptors(app.get(ResponseInterceptor));

    app.useGlobalFilters(app.get(AllExceptionsFilter));

    // Start the application
    const port = appCfg.port;
    await app.listen(port, '0.0.0.0');

    const e = process.env;
    console.log(
      `\n🚀 Server [${e.APP_NAME || 'API'}] running on http://0.0.0.0:${port}`,
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 ENV          : ${e.NODE_ENV || 'development'}`);
    console.log(
      `🗄️  Database     : ${e.DB_HOST || 'localhost'}:${e.DB_PORT || '5432'}/${e.DB_NAME || '-'}`,
    );
    console.log(
      `⚡ Redis         : ${e.REDIS_HOST || 'localhost'}:${e.REDIS_PORT || e.REDIS_DEV_PORT || '6379'}`,
    );
    console.log(
      `🔐 JWT Access   : expires in ${e.JWT_ACCESS_EXPIRES_IN || '-'}`,
    );
    console.log(
      `📧 SMTP         : ${e.SMTP_HOST || '-'}:${e.SMTP_PORT || '-'}`,
    );
    console.log(`🌐 CORS         : ${e.CORS_ORIGINS || '*'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return app;
  } catch (error) {
    console.error('Failed to start application', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
