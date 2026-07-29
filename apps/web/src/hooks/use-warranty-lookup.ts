"use client";

import { warrantiesService } from "@/src/services/warranties/warranties.service";
import { HttpClientError } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";

export type WarrantyLookupErrorKind =
  | "invalid"
  | "notFound"
  | "rateLimit"
  | "request";

export function getWarrantyLookupErrorKind(
  error: unknown,
): WarrantyLookupErrorKind {
  if (error instanceof HttpClientError) {
    if (error.status === 429) return "rateLimit";
    if (error.status === 404) return "notFound";
    if (error.status === 400 || error.status === 422) return "invalid";
  }

  return "request";
}

export function useWarrantyLookup() {
  const mutation = useMutation({
    mutationFn: (code: string) => warrantiesService.lookupWarranty(code),
  });

  return {
    ...mutation,
    errorKind: mutation.error
      ? getWarrantyLookupErrorKind(mutation.error)
      : null,
    lookup: mutation.mutate,
  };
}
