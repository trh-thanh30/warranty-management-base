import type { CategorySummary } from "./category.types.ts";
import type { ActivationCodeReportStatus } from "./activation-code-report.types.ts";
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
};

export type ProductSpecificationInput = {
  key: string;
  value: string;
};

export type ProductSpecification = ProductSpecificationInput & {
  group?: string;
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

export type ProductAssignedActivationCodeSummary = {
  id: string;
  code: string;
  status: ActivationCodeReportStatus;
  expiresAt: string;
  batchCode: string;
  canReplace: boolean;
  unavailableReason: Exclude<ActivationCodeReportStatus, "AVAILABLE"> | null;
};

export type ProductSummary = {
  id: string;
  sku: string;
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
  catalogueMetadata: Record<string, unknown> | null;
  status: ProductStatus;
  isPublished: boolean;
  publishedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner: ProductOwnerSummary | null;
  warranty: ProductWarrantySummary | null;
  warrantyDurationMonths: number | null;
  warrantyTerms: string | null;
  assignedActivationCode: ProductAssignedActivationCodeSummary | null;
  /** All codes assigned to this catalogue Product. */
  assignedActivationCodes: ProductAssignedActivationCodeSummary[];
  assets: ProductAssetSummary[];
};

export type ProductResponse = ProductSummary;

export type ActivationProductIneligibilityReason =
  | "PRODUCT_DELETED"
  | "PRODUCT_INACTIVE"
  | "ACTIVATION_REQUEST_PENDING"
  | "ACTIVATION_REQUEST_APPROVED"
  | "WARRANTY_MISSING"
  | "WARRANTY_CODE_MISSING"
  | "WARRANTY_ALREADY_ACTIVATED"
  | "WARRANTY_NOT_DRAFT";

export type ActivationProductEligibility =
  | {
      eligible: true;
      reason: null;
      requestCode: null;
    }
  | {
      eligible: false;
      reason: ActivationProductIneligibilityReason;
      requestCode: string | null;
    };

export type ActivationProductOption = ProductResponse & {
  activationEligibility: ActivationProductEligibility;
  activationCodeCounts: Partial<Record<ActivationCodeReportStatus, number>>;
};

export type ListActivationProductOptionsQuery = Pick<
  PaginationQuery,
  "page" | "limit"
> & {
  categoryId: string;
  search?: string;
};

export type ListProductsQuery = PaginationQuery & {
  search?: string;
  categoryId?: string;
  ownerCustomerId?: string;
  status?: ProductStatus | "ALL";
  isPublished?: "true" | "false";
  activationEligible?: "true" | "false";
  activationCodeAssignable?: "true" | "false";
  claimEligible?: "true" | "false";
  warrantyStatus?: WarrantyStatus;
  sortBy?: ProductSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateProductBody = {
  name: string;
  categoryId: string;
  warrantyDurationMonths: number;
  warrantyTerms?: string;
  brand?: string;
  model?: string;
  modelYear?: number;
  description?: string;
  catalogueMetadata?: Record<string, unknown>;
  coverAssetId?: string;
  galleryAssetIds?: string[];
  productCode?: string;
  displayName?: string;
  status?: ProductStatus;
  serialNumber?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateProductBody = {
  name?: string;
  categoryId?: string;
  brand?: string | null;
  model?: string | null;
  modelYear?: number | null;
  description?: string | null;
  catalogueMetadata?: Record<string, unknown> | null;
  coverAssetId?: string | null;
  galleryAssetIds?: string[];
  displayName?: string | null;
  productCode?: string;
  status?: ProductStatus;
  serialNumber?: string | null;
  metadata?: Record<string, unknown> | null;
  warrantyDurationMonths?: number;
  warrantyTerms?: string | null;
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
  specifications: ProductSpecification[];
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
  specifications: ProductSpecification[];
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
