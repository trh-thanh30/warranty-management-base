import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  let url = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || process.env.REDIS_DEV_PORT || '6379';
  const password = process.env.REDIS_PASSWORD || '';

  // Manual expansion for variables like ${VAR} which might not be expanded by Railway/dotenv
  // Also handle literal 'PASSWORD' which sometimes appears as a placeholder in Railway
  if (url) {
    if (url.includes('${')) {
      url = url
        .replace(/\${REDIS_HOST}/g, host)
        .replace(/\${REDIS_PORT}/g, port)
        .replace(/\${REDIS_DEV_PORT}/g, port)
        .replace(/\${REDIS_PASSWORD}/g, password);
    }

    // Safety check for literal 'PASSWORD' placeholder
    if (password && url.includes(':PASSWORD@')) {
      url = url.replace(':PASSWORD@', `:${password}@`);
    }
  }

  return {
    url: url || undefined,
    host,
    port: parseInt(port, 10),
    password: password || undefined,
    family: 0, // Support IPv6 for Railway internal network
  };
});
