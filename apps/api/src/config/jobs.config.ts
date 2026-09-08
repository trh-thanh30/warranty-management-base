import { registerAs } from '@nestjs/config';

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return !['false', '0', 'no', 'off'].includes(value.toLowerCase());
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default registerAs('jobs', () => ({
  timezone: process.env.TZ ?? 'Asia/Ho_Chi_Minh',
  exampleCron: process.env.EXAMPLE_CRON ?? '0 2 * * *',
  exampleJob: {
    enabled: parseBoolean(process.env.EXAMPLE_JOB_ENABLED, true),
    batchSize: parsePositiveInt(process.env.EXAMPLE_JOB_BATCH_SIZE, 500),
  },
  warrantyCertificateCleanup: {
    cron: process.env.WARRANTY_CERTIFICATE_CLEANUP_CRON ?? '0 3 * * 0',
    dryRun: parseBoolean(
      process.env.WARRANTY_CERTIFICATE_CLEANUP_DRY_RUN,
      true,
    ),
    enabled: parseBoolean(
      process.env.WARRANTY_CERTIFICATE_CLEANUP_ENABLED,
      false,
    ),
    retentionDays: parsePositiveInt(
      process.env.WARRANTY_CERTIFICATE_ORPHAN_RETENTION_DAYS,
      30,
    ),
  },
  storageUsageMonitor: {
    cron: process.env.STORAGE_USAGE_MONITOR_CRON ?? '0 4 * * *',
    enabled: parseBoolean(process.env.STORAGE_USAGE_MONITOR_ENABLED, false),
  },
  activationCodeExpiry: {
    cron: process.env.ACTIVATION_CODE_EXPIRY_CRON ?? '0 * * * *',
    enabled: parseBoolean(process.env.ACTIVATION_CODE_EXPIRY_ENABLED, true),
    batchSize: parsePositiveInt(
      process.env.ACTIVATION_CODE_EXPIRY_BATCH_SIZE,
      500,
    ),
  },
}));
