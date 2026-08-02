export const ADMIN_TWO_FACTOR_METHOD = {
  EMAIL_OTP: "EMAIL_OTP",
  PIN: "PIN",
} as const;

export type AdminTwoFactorMethod =
  (typeof ADMIN_TWO_FACTOR_METHOD)[keyof typeof ADMIN_TWO_FACTOR_METHOD];

export const ADMIN_LOGIN_CHALLENGE_METHOD = {
  METHOD_SELECTION: "METHOD_SELECTION",
  EMAIL_OTP: "EMAIL_OTP",
  PIN_SETUP: "PIN_SETUP",
  PIN_VERIFY: "PIN_VERIFY",
} as const;

export type AdminLoginChallengeMethod =
  (typeof ADMIN_LOGIN_CHALLENGE_METHOD)[keyof typeof ADMIN_LOGIN_CHALLENGE_METHOD];

export type AdminLoginPinChallengeMethod =
  | typeof ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP
  | typeof ADMIN_LOGIN_CHALLENGE_METHOD.PIN_VERIFY;

export type AdminVerificationChallengeMethod = Exclude<
  AdminLoginChallengeMethod,
  typeof ADMIN_LOGIN_CHALLENGE_METHOD.METHOD_SELECTION
>;
