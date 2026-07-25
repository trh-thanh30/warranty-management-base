import type { CategorySummary } from "./category.types.ts";
import type { PaginationQuery } from "./pagination.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";
import type { ProductCategory } from "../constants/catalog.ts";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type ProductAssetRole = "COVER" | "GALLERY" | "SERIAL" | "INSTALLATION";

export type ProductAssetSummary = {
  id: string;
  assetId: string;
  role: ProductAssetRole;
  sortOrder: number;
  altText: string | null;
  url: string;
  mimeType: string;
  originalName: string;
};

export type ProductSortBy =
  | "productCode"
  | "warrantyCode"
  | "serialNumber"
  | "name"
  | "category"
  | "status"
  | "publishedAt"
  | "createdAt"
  | "updatedAt";

export type ProductOwnerSummary = {
  customerId: string;
  ownerUserId: string | null;
  customerCode?: string;
  fullName?: string;
  purchaseDate: string | null;
  activatedAt: string | null;
};

export type ProductWarrantySummary = {
  id: string;
  warrantyCode: string | null;
  startDate: string;
  endDate: string;
  durationMonths: number;
  coverageLimitAmount: string | null;
  maxClaimCount: number | null;
  maxAmountPerClaim: string | null;
  status: WarrantyStatus;
  terms: string | null;
};

export type ProductSummary = {
  id: string;
  productCode: string;
  slug: string;
  warrantyCode: string | null;
  serialNumber: string | null;
  name: string;
  category: ProductCategory;
  categoryId: string | null;
  categoryRef: CategorySummary | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  description: string | null;
  status: ProductStatus;
  isPublished: boolean;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner: ProductOwnerSummary | null;
  warranty: ProductWarrantySummary | null;
  assets: ProductAssetSummary[];
};

export type ProductResponse = ProductSummary;

export type ListProductsQuery = PaginationQuery & {
  search?: string;
  category?: ProductCategory;
  categoryId?: string;
  ownerCustomerId?: string;
  status?: ProductStatus;
  isPublished?: "true" | "false";
  warrantyStatus?: WarrantyStatus;
  sortBy?: ProductSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateProductBody = {
  name: string;
  slug?: string;
  isPublished?: boolean;
  category: ProductCategory;
  categoryId: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  description?: string;
  status?: ProductStatus;
  serialNumber?: string;
  metadata?: Record<string, unknown>;
  coverAssetId?: string;
};

export type UpdateProductBody = {
  name?: string;
  slug?: string;
  category?: ProductCategory;
  categoryId?: string;
  brand?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  description?: string | null;
  status?: ProductStatus;
  serialNumber?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UpdateProductPublicationBody = {
  isPublished: boolean;
};

export type PublicProductSummary = {
  id: string;
  productCode: string;
  slug: string;
  name: string;
  categoryId: string | null;
  category: Pick<CategorySummary, "id" | "slug" | "name"> | null;
  brand: string | null;
  model: string | null;
  description: string | null;
  coverImageUrl: string | null;
  specifications: Array<{
    key: string;
    value: string;
  }>;
  warrantyDurationMonths: number | null;
  publishedAt: string;
};

export type ListPublicProductsQuery = PaginationQuery & {
  search?: string;
  categoryId?: string;
  sortBy?: Extract<ProductSortBy, "name" | "publishedAt">;
  sortOrder?: "asc" | "desc";
};

export type AssignProductOwnerBody = {
  customerId: string;
  autoGenerateWarrantyCode?: boolean;
  warrantyCode?: string;
  purchaseDate?: string;
};

export type AttachProductAssetBody = {
  assetId: string;
  role: ProductAssetRole;
  sortOrder?: number;
  altText?: string;
};

export type UpdateProductAssetBody = {
  role?: ProductAssetRole;
  sortOrder?: number;
  altText?: string | null;
};
