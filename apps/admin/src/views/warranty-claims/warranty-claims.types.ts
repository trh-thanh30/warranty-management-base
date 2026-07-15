import type {
  WarrantyClaimPriority,
  WarrantyClaimSortBy,
  WarrantyClaimStatus,
} from "@repo/shared";
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
  serviceCenterId: string;
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
