"use client";

import { HttpClientError } from "@repo/shared";
import type { CreateWarrantyClaimBody } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { warrantyClaimsService } from "@/src/services/warranty-claims/warranty-claims.service";

export type WarrantyClaimRequestErrorKind =
  | "alreadyOpen"
  | "invalid"
  | "notEligible"
  | "notFound"
  | "ownerMismatch"
  | "rateLimit"
  | "request";

const WARRANTY_NOT_ELIGIBLE_CODES = new Set([
  "WARRANTY_EXPIRED",
  "WARRANTY_NOT_ACTIVE",
  "WARRANTY_NOT_STARTED",
  "WARRANTY_VOIDED",
]);

export function getWarrantyClaimRequestErrorKind(
  error: unknown,
): WarrantyClaimRequestErrorKind {
  if (!(error instanceof HttpClientError)) return "request";
  if (error.status === 429) return "rateLimit";
  if (error.status === 404) return "notFound";

  const detailCode =
    error.details &&
    typeof error.details === "object" &&
    "code" in error.details
      ? String(error.details.code)
      : error.code;

  if (detailCode === "WARRANTY_CLAIM_ALREADY_OPEN") return "alreadyOpen";
  if (detailCode === "WARRANTY_CLAIM_OWNER_MISMATCH") return "ownerMismatch";
  if (detailCode !== undefined && WARRANTY_NOT_ELIGIBLE_CODES.has(detailCode)) {
    return "notEligible";
  }
  if (error.status === 400 || error.status === 422) return "invalid";

  return "request";
}

export function useWarrantyClaimRequest() {
  const mutation = useMutation({
    mutationFn: ({
      attachments,
      body,
    }: {
      attachments: File[];
      body: CreateWarrantyClaimBody;
    }) => warrantyClaimsService.createWarrantyClaim(body, attachments),
  });

  return {
    ...mutation,
    errorKind: mutation.error
      ? getWarrantyClaimRequestErrorKind(mutation.error)
      : null,
    submit: (body: CreateWarrantyClaimBody, attachments: File[]) =>
      mutation.mutateAsync({ attachments, body }),
  };
}
