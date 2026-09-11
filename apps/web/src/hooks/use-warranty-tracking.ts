"use client";

import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";
import { warrantyClaimsService } from "@/src/services/warranty-claims/warranty-claims.service";
import {
  getWarrantyTrackingCodeType,
  normalizeWarrantyActivationRequestCode,
} from "@repo/shared/utils";
import { HttpClientError } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";

export type WarrantyTrackingResult =
  | {
      kind: "activationRequest";
      request: Awaited<
        ReturnType<
          typeof warrantyActivationRequestsService.getActivationRequestByCode
        >
      >;
    }
  | {
      kind: "claim";
      claim: Awaited<
        ReturnType<typeof warrantyClaimsService.getWarrantyClaimByCode>
      >;
    };

export type WarrantyTrackingErrorKind = "notFound" | "rateLimit" | "request";

export function getWarrantyTrackingErrorKind(
  error: unknown,
): WarrantyTrackingErrorKind {
  if (error instanceof HttpClientError) {
    if (error.status === 404) return "notFound";
    if (error.status === 429) return "rateLimit";
  }

  return "request";
}

export function useWarrantyTracking() {
  const mutation = useMutation({
    mutationFn: async (
      trackingCode: string,
    ): Promise<WarrantyTrackingResult> => {
      const normalizedCode =
        normalizeWarrantyActivationRequestCode(trackingCode);
      const codeType = getWarrantyTrackingCodeType(normalizedCode);

      if (codeType === "activationRequest") {
        return {
          kind: "activationRequest",
          request:
            await warrantyActivationRequestsService.getActivationRequestByCode(
              normalizedCode,
            ),
        };
      }

      if (codeType === "claim") {
        return {
          kind: "claim",
          claim:
            await warrantyClaimsService.getWarrantyClaimByCode(normalizedCode),
        };
      }

      throw new Error("Unsupported warranty tracking code");
    },
  });

  return {
    ...mutation,
    errorKind: mutation.error
      ? getWarrantyTrackingErrorKind(mutation.error)
      : null,
    track: mutation.mutateAsync,
  };
}
