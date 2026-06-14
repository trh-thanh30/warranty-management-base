import { registerAs } from '@nestjs/config';

// client.config.ts
export default registerAs('client', () => ({
  nominatimBaseUrl:
    process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
  nominatimUserAgent: process.env.NOMINATIM_USER_AGENT || 'booking-base/1.0',
}));
