export const WARRANTY_CLAIM_RANDOM_CODE_PATTERN = /^CLM-[A-F0-9]{20}$/;
export const WARRANTY_CLAIM_CODE_MAX_LENGTH = 32;

export function normalizeWarrantyClaimCode(value: string) {
  return value.trim().toUpperCase();
}

export function isWarrantyClaimCode(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const normalizedValue = normalizeWarrantyClaimCode(value);

  return (
    normalizedValue.length <= WARRANTY_CLAIM_CODE_MAX_LENGTH &&
    WARRANTY_CLAIM_RANDOM_CODE_PATTERN.test(normalizedValue)
  );
}
