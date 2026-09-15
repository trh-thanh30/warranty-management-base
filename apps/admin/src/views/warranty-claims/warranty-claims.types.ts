import type {
  WarrantyClaimPriority,
  WarrantyClaimSortBy,
  WarrantyClaimStatus,
} from "@repo/shared";
import { z } from "zod";
import {
  WARRANTY_CLAIM_EVIDENCE_MAX_FILE_SIZE,
  WARRANTY_CLAIM_EVIDENCE_MIME_TYPES,
} from "@repo/shared/constants";
import type {
  WARRANTY_CLAIM_OVERDUE_FILTERS,
  WARRANTY_CLAIM_PRIORITY_FILTERS,
  WARRANTY_CLAIM_STATUS_FILTERS,
} from "./warranty-claims.constants";

export type WarrantyClaimStatusFilter =
  (typeof WARRANTY_CLAIM_STATUS_FILTERS)[number];

export type WarrantyClaimPriorityFilter =
  (typeof WARRANTY_CLAIM_PRIORITY_FILTERS)[number];

export type WarrantyClaimOverdueFilter =
  (typeof WARRANTY_CLAIM_OVERDUE_FILTERS)[number];

export type WarrantyClaimDirectoryFilters = {
  dateFrom: string;
  dateTo: string;
  isOverdue: WarrantyClaimOverdueFilter;
  priority: WarrantyClaimPriorityFilter;
  serviceCenter: string;
  status: WarrantyClaimStatusFilter;
};

export type WarrantyClaimAction =
  | "assignServiceCenter"
  | "priority"
  | "status"
  | "uploadAttachments";

export type WarrantyClaimSort = WarrantyClaimSortBy;

export type WarrantyClaimStatusOption = WarrantyClaimStatus;

export type WarrantyClaimPriorityOption = WarrantyClaimPriority;

export type WarrantyClaimRequesterSource = {
  fullName?: string | null;
  phone?: string | null;
};

export const warrantyClaimCreateFormSchema = z.object({
  attachments: z
    .array(z.custom<File>((value) => value instanceof File))
    // Evidence is optional while the upload field is temporarily hidden.
    .superRefine((files, context) => {
      for (const file of files) {
        if (
          !WARRANTY_CLAIM_EVIDENCE_MIME_TYPES.includes(
            file.type as (typeof WARRANTY_CLAIM_EVIDENCE_MIME_TYPES)[number],
          )
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "evidenceTypeInvalid",
          });
          return;
        }
        if (file.size > WARRANTY_CLAIM_EVIDENCE_MAX_FILE_SIZE) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "evidenceTooLarge",
          });
          return;
        }
      }
    }),
  issueDetail: z.string().trim().max(4000, "issueDetailLength"),
  issueTitle: z.string().trim().min(3, "issueTitleRequired").max(255),
  productId: z.string().trim().min(1, "productRequired"),
  requesterName: z
    .string()
    .trim()
    .min(1, "requesterNameRequired")
    .max(255, "requesterNameLength"),
  requesterPhone: z
    .string()
    .trim()
    .min(1, "requesterPhoneRequired")
    .max(32, "requesterPhoneLength"),
  warrantyCode: z.string().trim().min(1, "warrantyCodeRequired"),
});

export type WarrantyClaimCreateFormValues = z.infer<
  typeof warrantyClaimCreateFormSchema
>;
