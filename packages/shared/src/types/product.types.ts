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

export type ProductTemplateSpecificationInput = {
  key: string;
  value: string;
};

export type ProductTemplateSpecification = ProductTemplateSpecificationInput & {
  group?: string;
};

export type ProductTemplateMetadataInput = {
  applications?: string[];
  features?: string[];
  shortDescription?: string | null;
  specifications?: ProductTemplateSpecificationInput[];
};

export type ProductTemplateMetadata = {
  applications?: string[];
  features?: string[];
  shortDescription?: string | null;
  specifications?: ProductTemplateSpecification[];
  [key: string]: unknown;
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
  defaultWarrantyDurationMonths: number | null;
  defaultWarrantyTerms: string | null;
  metadata: ProductTemplateMetadata | null;
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
  isPublished?: boolean;
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
  defaultWarrantyDurationMonths?: number | null;
  defaultWarrantyTerms?: string;
  metadata?: ProductTemplateMetadataInput;
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
  defaultWarrantyDurationMonths?: number | null;
  defaultWarrantyTerms?: string | null;
  metadata?: ProductTemplateMetadataInput | null;
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

export type WarrantyCodeEditLockedReason =
  | "WARRANTY_NOT_DRAFT"
  | "OPEN_ACTIVATION_REQUEST";

export type ProductSummary = {
  id: string;
  templateId: string;
  template: ProductTemplateSummary;
  productCode: string;
  slug: string;
  warrantyCode: string | null;
  canEditWarrantyCode: boolean;
  warrantyCodeEditLockedReason: WarrantyCodeEditLockedReason | null;
  serialNumber: string | null;
  displayName: string | null;
  name: string;
  categoryId: string;
  categoryRef: CategorySummary;
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
  activationEligible?: "true" | "false";
  warrantyStatus?: WarrantyStatus;
  sortBy?: ProductSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateProductBody = {
  templateId: string;
  warrantyDurationMonths: number;
  productCode?: string;
  warrantyCode?: string;
  categoryId?: string;
  displayName?: string;
  status?: ProductStatus;
  serialNumber?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateProductBody = {
  categoryId?: string;
  displayName?: string | null;
  productCode?: string;
  status?: ProductStatus;
  serialNumber?: string | null;
  templateId?: string;
  metadata?: Record<string, unknown> | null;
  warrantyCode?: string;
  warrantyDurationMonths?: number;
};

export type PublicProductSummary = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  categoryId: string;
  category: Pick<CategorySummary, "id" | "slug" | "name">;
  brand: string | null;
  model: string | null;
  description: string | null;
  coverImageUrl: string | null;
  specifications: ProductTemplateSpecification[];
  warrantyDurationMonths: number;
  publishedAt: string;
};

export type PublicProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type PublicProductDetail = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: Pick<CategorySummary, "id" | "slug" | "name">;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  shortDescription: string | null;
  description: string | null;
  coverImage: PublicProductImage | null;
  galleryImages: PublicProductImage[];
  specifications: ProductTemplateSpecification[];
  features: string[];
  applications: string[];
  warranty: {
    durationMonths: number;
    terms: string | null;
  };
  publishedAt: string | null;
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
