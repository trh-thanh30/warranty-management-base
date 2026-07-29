import { registerAs } from '@nestjs/config';

export default registerAs('vietnamProvinces', () => ({
  enabled: process.env.VIETNAM_PROVINCES_ENABLED !== 'false',
  baseUrl:
    process.env.VIETNAM_PROVINCES_API_BASE_URL ??
    'https://provinces.open-api.vn/api/v2',
  timeoutMs: parseInt(
    process.env.VIETNAM_PROVINCES_API_TIMEOUT_MS ?? '5000',
    10,
  ),
  cacheTtlSeconds: parseInt(
    process.env.VIETNAM_PROVINCES_CACHE_TTL_SECONDS ?? '86400',
    10,
  ),
}));
