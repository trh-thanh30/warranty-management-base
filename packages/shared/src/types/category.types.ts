import type { PaginationQuery } from "./pagination.types.ts";
import type { CategoryType } from "../constants/catalog.ts";
import type { CategoryActivationFieldConfig } from "./category-activation-field.types.ts";

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
  /** Whether products in this category use the activation-code workflow. */
  activationCodeEnabled?: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryResponse = CategorySummary & {
  /** Optional during the activation-field storage migration. */
  activationFormEnabled?: boolean;
  /** Optional during the activation-field storage migration. */
  activationFields?: CategoryActivationFieldConfig[];
  children?: CategorySummary[];
};

export type CategoryTreeNode = CategorySummary & {
  children: CategoryTreeNode[];
  isContextOnly?: boolean;
};

export type CategoryTreeResponse = {
  items: CategoryTreeNode[];
  meta: {
    page: number;
    limit: number;
    totalRoots: number;
    totalCategories: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type CategoryParentOption = Pick<
  CategorySummary,
  "id" | "isActive" | "name" | "order" | "parentId"
> & {
  depth: number;
  path: string[];
};

export type PublicProductCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  productCount: number;
};

export type ListPublicProductCategoriesQuery = Pick<
  PaginationQuery,
  "page" | "limit"
> & {
  hasImage?: boolean;
};

export type ListCategoriesQuery = PaginationQuery & {
  type?: CategoryType;
  parentId?: string;
  isActive?: "true" | "false" | "all";
  search?: string;
  sortBy?: CategorySortBy;
  sortOrder?: "asc" | "desc";
};

export type ListCategoryTreeQuery = PaginationQuery & {
  type: CategoryType;
  isActive?: "true" | "false" | "all";
  search?: string;
  sortBy?: CategorySortBy;
  sortOrder?: "asc" | "desc";
};

export type ListCategoryParentOptionsQuery = {
  type: CategoryType;
  currentCategoryId?: string;
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
  activationCodeEnabled?: boolean;
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
  activationCodeEnabled?: boolean;
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

export type CategoryImportResult = {
  created: number;
  updated: number;
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
};
