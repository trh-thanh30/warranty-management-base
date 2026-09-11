import { isWarrantyClaimCode } from "./warranty-claim-code.ts";

export const WARRANTY_ACTIVATION_REQUEST_CODE_PATTERN = /^WAR-\d{8}-\d{4,}$/;
export const WARRANTY_ACTIVATION_REQUEST_CODE_MAX_LENGTH = 32;

export type WarrantyTrackingCodeType = "activationRequest" | "claim";

export function normalizeWarrantyActivationRequestCode(value: string) {
  return value.trim().toUpperCase();
}

export function isWarrantyActivationRequestCode(
  value: unknown,
): value is string {
  if (typeof value !== "string") return false;

  const normalizedValue = normalizeWarrantyActivationRequestCode(value);

  return (
    normalizedValue.length <= WARRANTY_ACTIVATION_REQUEST_CODE_MAX_LENGTH &&
    WARRANTY_ACTIVATION_REQUEST_CODE_PATTERN.test(normalizedValue)
  );
}

export function getWarrantyTrackingCodeType(
  value: unknown,
): WarrantyTrackingCodeType | null {
  if (isWarrantyActivationRequestCode(value)) return "activationRequest";
  if (isWarrantyClaimCode(value)) return "claim";
  return null;
}
