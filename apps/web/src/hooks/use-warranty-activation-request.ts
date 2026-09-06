"use client";

import { HttpClientError } from "@repo/shared";
import type { CreatePublicWarrantyActivationRequestBody } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";

export type WarrantyActivationErrorKind =
  | "activationCodeInvalid"
  | "alreadyOpen"
  | "invalid"
  | "notEligible"
  | "notFound"
  | "rateLimit"
  | "request";

export function getWarrantyActivationErrorKind(
  error: unknown,
): WarrantyActivationErrorKind {
  if (!(error instanceof HttpClientError)) return "request";

  if (error.status === 429) return "rateLimit";

  const detailCode =
    error.details &&
    typeof error.details === "object" &&
    "code" in error.details
      ? String(error.details.code)
      : error.code;

  if (detailCode === "ACTIVATION_CODE_INVALID_OR_EXPIRED") {
    return "activationCodeInvalid";
  }
  if (detailCode === "ACTIVATION_CODE_PRODUCT_NOT_ASSIGNED") {
    return "notEligible";
  }
  if (detailCode === "ACTIVATION_REQUEST_ALREADY_OPEN") return "alreadyOpen";
  if (error.status === 400 || error.status === 422) return "invalid";

  return "request";
}

export function useWarrantyActivationRequest() {
  const mutation = useMutation({
    mutationFn: (body: CreatePublicWarrantyActivationRequestBody) =>
      warrantyActivationRequestsService.createActivationRequest(body),
  });

  return {
    ...mutation,
    errorKind: mutation.error
      ? getWarrantyActivationErrorKind(mutation.error)
      : null,
    submit: mutation.mutateAsync,
  };
}
