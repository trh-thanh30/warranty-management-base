import type { PaginationQuery } from "./pagination.types.ts";

export type DealerSortBy = "name" | "province" | "createdAt" | "updatedAt";

export type DealerSummary = {
  id: string;
  name: string;
  phone: string | null;
  address: string;
  province: string;
  salesName: string | null;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type DealerResponse = DealerSummary;

export type ListDealersQuery = PaginationQuery & {
  search?: string;
  province?: string;
  isActive?: string;
  sortBy?: DealerSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateDealerBody = {
  name: string;
  phone?: string;
  address: string;
  province: string;
  salesName?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateDealerBody = {
  name?: string;
  phone?: string | null;
  address?: string;
  province?: string;
  salesName?: string | null;
  isActive?: boolean;
  metadata?: Record<string, unknown> | null;
};
