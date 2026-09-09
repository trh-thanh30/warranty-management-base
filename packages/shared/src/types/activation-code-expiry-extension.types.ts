export type ExtendActivationCodeExpiryBody = {
  months: number;
};

export type ExtendActivationCodeExpiryResult = {
  activationCodeId: string;
  previousExpiresAt: string;
  expiresAt: string;
};

export type ExtendActivationCodeBatchExpiryResult = {
  batchId: string;
  previousExpiresAt: string;
  expiresAt: string;
  extendedCount: number;
  skipped: {
    activated: number;
    revoked: number;
    expired: number;
  };
};
