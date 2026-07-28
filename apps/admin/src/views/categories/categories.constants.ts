import type { CategoryType } from "@repo/shared";

export { CATEGORY_TYPES } from "@repo/shared/constants";

export const MANAGEABLE_CATEGORY_TYPES = [
  "PRODUCT",
  "CONTENT_PAGE",
] as const satisfies readonly CategoryType[];

export type ManageableCategoryType = (typeof MANAGEABLE_CATEGORY_TYPES)[number];

export const CATEGORIES_PAGE_SIZE = 10;

export const CATEGORY_STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"] as const;
