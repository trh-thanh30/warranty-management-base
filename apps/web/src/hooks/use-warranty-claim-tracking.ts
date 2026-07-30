"use client";

import { warrantyClaimsService } from "@/src/services/warranty-claims/warranty-claims.service";
import { HttpClientError } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";

export type WarrantyClaimTrackingErrorKind =
  | "notFound"
  | "rateLimit"
  | "request";

export function getWarrantyClaimTrackingErrorKind(
  error: unknown,
): WarrantyClaimTrackingErrorKind {
  if (error instanceof HttpClientError) {
    if (error.status === 404) return "notFound";
    if (error.status === 429) return "rateLimit";
  }

  return "request";
}

export function useWarrantyClaimTracking() {
  const mutation = useMutation({
    mutationFn: (claimCode: string) =>
      warrantyClaimsService.getWarrantyClaimByCode(claimCode),
  });

  return {
    ...mutation,
    errorKind: mutation.error
      ? getWarrantyClaimTrackingErrorKind(mutation.error)
      : null,
    track: mutation.mutateAsync,
  };
}
