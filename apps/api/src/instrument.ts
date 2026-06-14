import * as Sentry from '@sentry/nestjs';
import { loadEnv } from '@/load-env';

loadEnv();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: true,
});
