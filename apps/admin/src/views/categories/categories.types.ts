import type { CategoryType } from "@repo/shared";
import type { CATEGORY_STATUS_FILTERS } from "./categories.constants";

export type CategoryStatusFilter = (typeof CATEGORY_STATUS_FILTERS)[number];

export type CategoryTypeFilter = "ALL" | CategoryType;
