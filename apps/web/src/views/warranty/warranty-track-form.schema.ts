import {
  isWarrantyClaimCode,
  normalizeWarrantyClaimCode,
} from "@repo/shared/utils";
import { z } from "zod";

export type WarrantyTrackFormValues = {
  claimCode: string;
};

export function createWarrantyTrackFormSchema(messages: {
  claimCodeInvalid: string;
}) {
  return z.object({
    claimCode: z
      .string()
      .trim()
      .transform(normalizeWarrantyClaimCode)
      .refine(isWarrantyClaimCode, messages.claimCodeInvalid),
  });
}
