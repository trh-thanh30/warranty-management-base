import type { CategorySummary } from "./category.types.ts";
import type { PaginationQuery } from "./pagination.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";

export type ProductCategory =
  | "CAR"
  | "ACCESSORY"
  | "SPARE_PART"
  | "SERVICE_PACKAGE";

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
  warrantyCode: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: WarrantyStatus;
  terms: string | null;
};

export type ProductSummary = {
  id: string;
  productCode: string;
  warrantyCode: string;
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
  status?: ProductStatus;
  warrantyStatus?: WarrantyStatus;
  sortBy?: ProductSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateProductBody = {
  name: string;
  category: ProductCategory;
  categoryId?: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  description?: string;
  status?: ProductStatus;
  serialNumber?: string;
  autoGenerateWarrantyCode?: boolean;
  warrantyCode?: string;
  customerId?: string;
  purchaseDate?: string;
  activatedAt?: string;
  durationMonths?: number;
  warrantyTerms?: string;
  metadata?: Record<string, unknown>;
  coverAssetId?: string;
};

export type UpdateProductBody = {
  name?: string;
  category?: ProductCategory;
  categoryId?: string | null;
  brand?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  description?: string | null;
  status?: ProductStatus;
  serialNumber?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AssignProductOwnerBody = {
  customerId: string;
  purchaseDate?: string;
  activatedAt?: string;
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
