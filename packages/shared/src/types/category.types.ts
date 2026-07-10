import type { PaginationQuery } from "./pagination.types.ts";

export type CategoryType =
  | "PRODUCT"
  | "CONTENT_PAGE"
  | "ASSET"
  | "WARRANTY_CLAIM_ISSUE";

export type CategorySortBy =
  | "name"
  | "slug"
  | "order"
  | "createdAt"
  | "updatedAt"
  | "isActive";

export type CategorySummary = {
  id: string;
  type: CategoryType;
  code: string | null;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryResponse = CategorySummary & {
  children?: CategorySummary[];
};

export type ListCategoriesQuery = PaginationQuery & {
  type?: CategoryType;
  parentId?: string;
  isActive?: "true" | "false";
  search?: string;
  sortBy?: CategorySortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateCategoryBody = {
  type: CategoryType;
  code?: string;
  slug?: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
};

export type UpdateCategoryBody = {
  code?: string | null;
  slug?: string;
  name?: string;
  description?: string | null;
  parentId?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  order?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type ReorderCategoryItem = {
  id: string;
  order: number;
};

export type ReorderCategoriesBody = {
  parentId?: string | null;
  items: ReorderCategoryItem[];
};
