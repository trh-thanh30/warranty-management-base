import type { ProductStatus, WarrantyStatus } from "@repo/shared";
export { PRODUCT_CATEGORIES } from "@repo/shared/constants";

export const PRODUCT_STATUS_FILTERS = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
  "DELETED",
] as const satisfies Array<"ALL" | ProductStatus>;

export const WARRANTY_STATUS_FILTERS = [
  "ALL",
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "VOIDED",
] as const satisfies Array<"ALL" | WarrantyStatus>;
