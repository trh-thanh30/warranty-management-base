import { registerAs } from '@nestjs/config';

// client.config.ts
export default registerAs('client', () => ({
  warrantyLookupUrl: process.env.CLIENT_WARRANTY_LOOKUP_URL?.trim(),
  nominatimBaseUrl:
    process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
  nominatimUserAgent:
    process.env.NOMINATIM_USER_AGENT || 'warranty-management-base/1.0',
}));
