import { z } from "zod";

const WARRANTY_CODE_MIN_LENGTH = 6;
const WARRANTY_CODE_MAX_LENGTH = 64;
const WARRANTY_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

export type WarrantyLookupFormValidationMessages = {
  format: string;
  maxLength: string;
  minLength: string;
  required: string;
};

export type WarrantyLookupFormValues = {
  warrantyCode: string;
};

export function createWarrantyLookupFormSchema(
  messages: WarrantyLookupFormValidationMessages,
) {
  return z.object({
    warrantyCode: z
      .string()
      .trim()
      .min(1, messages.required)
      .min(WARRANTY_CODE_MIN_LENGTH, messages.minLength)
      .max(WARRANTY_CODE_MAX_LENGTH, messages.maxLength)
      .regex(WARRANTY_CODE_PATTERN, messages.format),
  });
}
