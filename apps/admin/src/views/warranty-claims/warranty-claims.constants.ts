import type { WarrantyClaimPriority, WarrantyClaimStatus } from "@repo/shared";

export const WARRANTY_CLAIMS_PAGE_SIZE = 10;

export const WARRANTY_CLAIM_STATUS_FILTERS = [
  "ALL",
  "SUBMITTED",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
  "IN_REPAIR",
  "COMPLETED",
  "CANCELLED",
] as const;

export const WARRANTY_CLAIM_PRIORITY_FILTERS = [
  "ALL",
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const;

export const WARRANTY_CLAIM_OVERDUE_FILTERS = [
  "ALL",
  "OVERDUE",
  "NOT_OVERDUE",
] as const;

export const WARRANTY_CLAIM_STATUS_TRANSITIONS: Record<
  WarrantyClaimStatus,
  WarrantyClaimStatus[]
> = {
  SUBMITTED: ["REVIEWING", "CANCELLED"],
  REVIEWING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_REPAIR", "CANCELLED"],
  IN_REPAIR: ["COMPLETED", "CANCELLED"],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export const WARRANTY_CLAIM_TERMINAL_STATUSES: WarrantyClaimStatus[] = [
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

export const WARRANTY_CLAIM_PRIORITY_ORDER: Record<
  WarrantyClaimPriority,
  number
> = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
};
