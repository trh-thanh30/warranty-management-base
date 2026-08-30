import { registerAs } from '@nestjs/config';

/** Configuration for hashing and encrypting printable activation codes. */
export default registerAs('activationCode', () => ({
  algorithm: (process.env.ACTIVATION_CODE_ALGORITHM ??
    'aes-256-gcm') as 'aes-256-gcm',
  ivBytes: Number(process.env.ACTIVATION_CODE_IV_BYTES ?? 12),
  secret: process.env.ACTIVATION_CODE_SECRET,
  // Business policy is persisted in SystemConfig; these are bootstrap defaults only.
  expiryMonths: 6,
  defaultBatchQuantity: 50,
  minBatchQuantity: Number(
    process.env.ACTIVATION_CODE_MIN_BATCH_QUANTITY ?? 50,
  ),
  maxBatchQuantity: Number(
    process.env.ACTIVATION_CODE_MAX_BATCH_QUANTITY ?? 1000,
  ),
  createAttempts: Number(process.env.ACTIVATION_CODE_CREATE_ATTEMPTS ?? 3),
}));
