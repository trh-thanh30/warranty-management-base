import {
  PHONE_NUMBER_PATTERN,
  WARRANTY_CLAIM_ISSUE_OPTIONS,
} from "@repo/shared/constants";
import type { WarrantyClaimIssueOption } from "@repo/shared";
import { z } from "zod";

export type WarrantyClaimRequestValidationMessages = {
  detailsInvalid: string;
  issueRequired: string;
  nameInvalid: string;
  phoneInvalid: string;
  warrantyCodeInvalid: string;
};

export type WarrantyClaimRequestFormValues = {
  issue: WarrantyClaimIssueOption;
  issueDetail: string;
  requesterName: string;
  requesterPhone: string;
  warrantyCode: string;
};

export function createWarrantyClaimRequestFormSchema(
  messages: WarrantyClaimRequestValidationMessages,
) {
  return z.object({
    issue: z.enum(WARRANTY_CLAIM_ISSUE_OPTIONS, {
      errorMap: () => ({ message: messages.issueRequired }),
    }),
    issueDetail: z.string().trim().max(4000, messages.detailsInvalid),
    requesterName: z
      .string()
      .trim()
      .min(2, messages.nameInvalid)
      .max(255, messages.nameInvalid),
    requesterPhone: z
      .string()
      .trim()
      .min(6, messages.phoneInvalid)
      .max(32, messages.phoneInvalid)
      .regex(PHONE_NUMBER_PATTERN, messages.phoneInvalid),
    warrantyCode: z
      .string()
      .trim()
      .min(6, messages.warrantyCodeInvalid)
      .max(64, messages.warrantyCodeInvalid)
      .regex(/^[A-Z0-9-]+$/i, messages.warrantyCodeInvalid),
  });
}
