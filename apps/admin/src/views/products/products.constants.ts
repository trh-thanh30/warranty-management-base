import type {
  ProductCategory,
  ProductStatus,
  WarrantyStatus,
} from "@repo/shared";

export const PRODUCT_CATEGORIES = [
  "CAR",
  "ACCESSORY",
  "SPARE_PART",
  "SERVICE_PACKAGE",
] as const satisfies ProductCategory[];

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
