import type { ListWarrantiesQuery, WarrantyStatus } from "@repo/shared";

export type WarrantyStatusFilter = "ALL" | WarrantyStatus;

export type WarrantySortBy = NonNullable<ListWarrantiesQuery["sortBy"]>;
