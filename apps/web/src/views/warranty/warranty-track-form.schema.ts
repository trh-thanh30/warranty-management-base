import {
  getWarrantyTrackingCodeType,
  normalizeWarrantyActivationRequestCode,
} from "@repo/shared/utils";
import { z } from "zod";

export type WarrantyTrackFormValues = {
  trackingCode: string;
};

export function createWarrantyTrackFormSchema(messages: {
  trackingCodeInvalid: string;
}) {
  return z.object({
    trackingCode: z
      .string()
      .trim()
      .transform(normalizeWarrantyActivationRequestCode)
      .refine(
        (value) => getWarrantyTrackingCodeType(value) !== null,
        messages.trackingCodeInvalid,
      ),
  });
}
