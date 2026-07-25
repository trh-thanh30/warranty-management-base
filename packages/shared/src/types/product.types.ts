import type { CategorySummary } from "./category.types.ts";
import type { PaginationQuery } from "./pagination.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";

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
  source?: "PRODUCT" | "TEMPLATE";
};

export type ProductTemplateSummary = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryRef: CategorySummary | null;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  description: string | null;
  defaultWarrantyDurationMonths: number;
  defaultWarrantyTerms: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  productCount: number;
  assets: ProductAssetSummary[];
  createdAt: string;
  updatedAt: string;
};

export type ListProductTemplatesQuery = PaginationQuery & {
  search?: string;
  isActive?: boolean;
};

export type CreateProductTemplateBody = {
  sku?: string;
  slug?: string;
  name: string;
  categoryId: string;
  brand?: string;
  model?: string;
  modelYear?: number;
  description?: string;
  defaultWarrantyDurationMonths?: number;
  defaultWarrantyTerms?: string;
  metadata?: Record<string, unknown>;
  isPublished?: boolean;
  coverAssetId?: string;
  galleryAssetIds?: string[];
};

export type UpdateProductTemplateBody = {
  sku?: string;
  slug?: string;
  name?: string;
  categoryId?: string;
  brand?: string | null;
  model?: string | null;
  modelYear?: number | null;
  description?: string | null;
  defaultWarrantyDurationMonths?: number;
  defaultWarrantyTerms?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
  isPublished?: boolean;
  coverAssetId?: string | null;
  galleryAssetIds?: string[];
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
  templateId: string;
  template: ProductTemplateSummary;
  productCode: string;
  slug: string;
  warrantyCode: string | null;
  serialNumber: string | null;
  displayName: string | null;
  name: string;
  categoryId: string | null;
  categoryRef: CategorySummary | null;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
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
  categoryId?: string;
  templateId?: string;
  ownerCustomerId?: string;
  status?: ProductStatus;
  isPublished?: "true" | "false";
  warrantyStatus?: WarrantyStatus;
  sortBy?: ProductSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateProductBody = {
  templateId: string;
  displayName?: string;
  status?: ProductStatus;
  serialNumber?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateProductBody = {
  displayName?: string | null;
  status?: ProductStatus;
  serialNumber?: string | null;
  metadata?: Record<string, unknown> | null;
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
