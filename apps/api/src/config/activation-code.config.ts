import { registerAs } from '@nestjs/config';

/** Configuration for hashing and encrypting printable activation codes. */
export default registerAs('activationCode', () => ({
  algorithm: (process.env.ACTIVATION_CODE_ALGORITHM ??
    'aes-256-gcm') as 'aes-256-gcm',
  ivBytes: Number(process.env.ACTIVATION_CODE_IV_BYTES ?? 12),
  secret: process.env.ACTIVATION_CODE_SECRET,
}));
