import type { ProductStatus } from "@repo/shared";
export { PRODUCT_CATEGORIES } from "@repo/shared/constants";

export const PRODUCT_STATUS_FILTERS = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
  "DELETED",
] as const satisfies Array<"ALL" | ProductStatus>;
