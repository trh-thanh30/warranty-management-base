import { registerAs } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';

export default registerAs('cookie', () => {
  const domain = isProd ? process.env.COOKIE_DOMAIN : 'localhost';
  const secure = process.env.COOKIE_SECURE === 'true';
  const sameSite =
    (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none' | undefined) ??
    'lax';
  const partitioned = process.env.COOKIE_PARTITIONED === 'true';

  return {
    // In production, if domain is not explicitly provided or is localhost,
    // it's better to leave it undefined so it defaults to the host domain.
    domain: domain && domain !== 'localhost' ? domain : undefined,
    // sameSite='none' requires secure=true, so HTTP deployments must use lax/strict.
    sameSite: sameSite,
    secure,
    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000', 10),
    path: process.env.COOKIE_PATH || '/',
    // Only enable CHIPS/Partitioned cookies for true third-party embeds.
    // Admin/API run under the same site in production, so regular cross-subdomain
    // cookies are more reliable.
    partitioned,
  };
});
