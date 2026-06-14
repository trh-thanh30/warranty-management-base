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
}));
