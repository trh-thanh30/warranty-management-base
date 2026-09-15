import { registerAs } from '@nestjs/config';

export default registerAs('requestCertificate', () => ({
  templateVersion: Number(
    process.env.REQUEST_CERTIFICATE_TEMPLATE_VERSION ?? 1,
  ),
}));
