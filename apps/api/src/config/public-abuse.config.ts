import { registerAs } from '@nestjs/config';

export type PublicAbuseConfig = {
  dailyCodeLimit: number;
  dailyIpLimit: number;
  dailyPhoneLimit: number;
  dailyWindowSeconds: number;
  turnstileSecretKey?: string;
};

export default registerAs(
  'publicAbuse',
  (): PublicAbuseConfig => ({
    dailyCodeLimit: Number(process.env.PUBLIC_SUBMISSION_DAILY_CODE_LIMIT ?? 3),
    dailyIpLimit: Number(process.env.PUBLIC_SUBMISSION_DAILY_IP_LIMIT ?? 20),
    dailyPhoneLimit: Number(
      process.env.PUBLIC_SUBMISSION_DAILY_PHONE_LIMIT ?? 5,
    ),
    dailyWindowSeconds: Number(
      process.env.PUBLIC_SUBMISSION_DAILY_WINDOW_SECONDS ?? 86_400,
    ),
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY?.trim() || undefined,
  }),
);
