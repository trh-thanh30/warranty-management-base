import type { WarrantyStatus } from "@repo/shared";

export const WARRANTY_STATUS_FILTERS = [
  "ALL",
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "VOIDED",
] as const satisfies Array<"ALL" | WarrantyStatus>;
