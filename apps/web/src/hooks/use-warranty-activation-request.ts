"use client";

import { HttpClientError } from "@repo/shared";
import type { CreatePublicWarrantyActivationRequestBody } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";

export type WarrantyActivationErrorKind =
  | "activationCodeInvalid"
  | "activationCodeNotApplicable"
  | "activationCodeNotAssigned"
  | "alreadyOpen"
  | "invalid"
  | "network"
  | "notFound"
  | "rateLimit"
  | "request"
  | "serviceUnavailable"
  | "verification";

export type ActivationCodeErrorKind = Extract<
  WarrantyActivationErrorKind,
  | "activationCodeInvalid"
  | "activationCodeNotApplicable"
  | "activationCodeNotAssigned"
  | "alreadyOpen"
  | "notFound"
>;

const ACTIVATION_CODE_ERROR_KINDS: ReadonlySet<WarrantyActivationErrorKind> =
  new Set([
    "activationCodeInvalid",
    "activationCodeNotApplicable",
    "activationCodeNotAssigned",
    "alreadyOpen",
    "notFound",
  ]);

const SERVICE_UNAVAILABLE_CODES = new Set([
  "ACTIVATION_CODE_UNAVAILABLE",
  "ACTIVATION_REQUEST_CREATE_FAILED",
  "WARRANTY_CODE_GENERATION_FAILED",
]);

export function isActivationCodeErrorKind(
  kind: WarrantyActivationErrorKind | null,
): kind is ActivationCodeErrorKind {
  return kind !== null && ACTIVATION_CODE_ERROR_KINDS.has(kind);
}

export function getWarrantyActivationErrorKind(
  error: unknown,
): WarrantyActivationErrorKind {
  if (!(error instanceof HttpClientError)) return "request";

  if (error.isNetworkError) return "network";
  if (error.status === 429) return "rateLimit";

  const detailCode =
    error.details &&
    typeof error.details === "object" &&
    "code" in error.details
      ? String(error.details.code)
      : error.code;

  if (detailCode?.startsWith("TURNSTILE_")) return "verification";

  if (detailCode === "ACTIVATION_CODE_INVALID_OR_EXPIRED") {
    return "activationCodeInvalid";
  }
  if (detailCode === "ACTIVATION_CODE_PRODUCT_NOT_ASSIGNED") {
    return "activationCodeNotAssigned";
  }
  if (detailCode === "ACTIVATION_CODE_NOT_APPLICABLE") {
    return "activationCodeNotApplicable";
  }
  if (detailCode === "ACTIVATION_CODE_PRODUCT_MISMATCH") {
    return "activationCodeInvalid";
  }
  if (detailCode === "ACTIVATION_REQUEST_ALREADY_OPEN") return "alreadyOpen";
  if (detailCode && SERVICE_UNAVAILABLE_CODES.has(detailCode)) {
    return "serviceUnavailable";
  }
  if (error.status === 404) return "notFound";
  if (error.status && error.status >= 500) return "serviceUnavailable";
  if (error.status === 400 || error.status === 422) return "invalid";

  return "request";
}

export function useWarrantyActivationRequest() {
  const mutation = useMutation({
    mutationFn: ({
      body,
      turnstileToken,
    }: {
      body: CreatePublicWarrantyActivationRequestBody;
      turnstileToken?: string;
    }) =>
      warrantyActivationRequestsService.createActivationRequest(
        body,
        turnstileToken,
      ),
  });

  return {
    ...mutation,
    errorKind: mutation.error
      ? getWarrantyActivationErrorKind(mutation.error)
      : null,
    submit: (
      body: CreatePublicWarrantyActivationRequestBody,
      turnstileToken?: string,
    ) => mutation.mutateAsync({ body, turnstileToken }),
  };
}
