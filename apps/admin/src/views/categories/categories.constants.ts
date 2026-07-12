import type { CategoryType } from "@repo/shared";

export const CATEGORIES_PAGE_SIZE = 10;

export const CATEGORY_TYPES = [
  "PRODUCT",
  "CONTENT_PAGE",
  "ASSET",
  "WARRANTY_CLAIM_ISSUE",
] as const satisfies CategoryType[];

export const CATEGORY_STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"] as const;
