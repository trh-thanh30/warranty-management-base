import { registerAs } from '@nestjs/config';

export function resolveEmailBrandLogoUrl(
  explicitUrl?: string,
  assetCdnUrl?: string,
) {
  const configuredLogoUrl = explicitUrl?.trim();
  if (configuredLogoUrl) return configuredLogoUrl;

  const configuredAssetCdnUrl = assetCdnUrl?.trim();
  if (!configuredAssetCdnUrl) return undefined;

  try {
    const hostname = new URL(configuredAssetCdnUrl).hostname.toLowerCase();
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  return `${configuredAssetCdnUrl.replace(/\/$/, '')}/website-config/logo_2.png`;
}

export default registerAs('email', () => {
  const smtpUser = process.env.SMTP_USER || '';
  const appName = process.env.APP_NAME || 'Warranty Management API';

  // Manual expansion for variables like ${VAR} which might not be expanded by Railway/dotenv
  let from = process.env.EMAIL_FROM || `"${appName}" <${smtpUser}>`;

  if (from.includes('${')) {
    from = from
      .replace(/\${APP_NAME}/g, appName)
      .replace(/\${SMTP_USER}/g, smtpUser);
  }

  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure:
      process.env.SMTP_SECURE === 'true' ||
      (process.env.SMTP_SECURE === undefined ? false : false),
    user: smtpUser,
    pass: process.env.SMTP_PASS || '',
    from,
    brandLogoUrl: resolveEmailBrandLogoUrl(
      process.env.EMAIL_BRAND_LOGO_URL,
      process.env.ASSET_CDN_URL,
    ),
    templatesPath:
      process.env.EMAIL_TEMPLATES_PATH || 'src/modules/email/templates',
  };
});
