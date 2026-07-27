import type {
  WarrantyClaimPriority,
  WarrantyClaimSortBy,
  WarrantyClaimStatus,
} from "@repo/shared";
import { z } from "zod";
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
  claimCode: string;
  dateFrom: string;
  dateTo: string;
  isOverdue: WarrantyClaimOverdueFilter;
  priority: WarrantyClaimPriorityFilter;
  serviceCenter: string;
  status: WarrantyClaimStatusFilter;
  warrantyCode: string;
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
