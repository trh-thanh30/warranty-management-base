import { registerAs } from '@nestjs/config';

export default registerAs('geoapify', () => ({
  apiKey: process.env.GEOAPIFY_API_KEY ?? '',
  baseUrl: process.env.GEOAPIFY_API_BASE_URL ?? 'https://api.geoapify.com/v1',
  cacheTtlSeconds: parseInt(
    process.env.GEOAPIFY_CACHE_TTL_SECONDS ?? '2592000',
    10,
  ),
  maxResults: parseInt(process.env.GEOAPIFY_MAX_RESULTS ?? '5', 10),
  timeoutMs: parseInt(process.env.GEOAPIFY_TIMEOUT_MS ?? '5000', 10),
}));
