import type { ProductSummary } from "./product.types.ts";
import type { CategorySummary } from "./category.types.ts";
import type { ActivationCodeReportStatus } from "./activation-code-report.types.ts";

export type WarrantyStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";

export type WarrantyAdjustmentValue = string | number | null;

export type WarrantyAdjustmentChange = {
  before: WarrantyAdjustmentValue;
  after: WarrantyAdjustmentValue;
};

export type WarrantyAdjustmentHistoryEntry = {
  reason: string;
  changedFields: string[];
  changes: Record<string, WarrantyAdjustmentChange>;
  adjustedAt: string;
  adjustedByUserId: string | null;
  adjustedByUser: WarrantyAdjustmentActor | null;
};

export type WarrantyAdjustmentActor = {
  id: string;
  email: string;
  name: string | null;
};

export type WarrantyAdjustmentMetadata = {
  adjustmentHistory?: WarrantyAdjustmentHistoryEntry[];
  lastAdjustment?: Omit<
    WarrantyAdjustmentHistoryEntry,
    "changes" | "adjustedByUser"
  > & {
    changes?: Record<string, WarrantyAdjustmentChange>;
    adjustedByUser?: WarrantyAdjustmentActor | null;
  };
};

export type WarrantySummary = {
  id: string;
  productId: string;
  warrantyCode: string | null;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number;
  coverageLimitAmount: string | null;
  maxClaimCount: number | null;
  maxAmountPerClaim: string | null;
  status: WarrantyStatus;
  serialNumber: string | null;
  terms: string | null;
  metadata: Record<string, unknown> | null;
  activatedByUserId: string | null;
  activatedByUser: WarrantyUserSummary | null;
  voidedAt: string | null;
  voidedByUserId: string | null;
  voidedByUser: WarrantyUserSummary | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
  dealer: WarrantyDealerSummary | null;
  owner: WarrantyOwnerSummary | null;
};

export type WarrantyDealerSummary = {
  id: string;
  dealerCode: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
};

export type WarrantyUserSummary = {
  id: string;
  email: string;
  name: string | null;
};

export type WarrantyLookupResult = {
  product: Pick<
    ProductSummary,
    | "id"
    | "productCode"
    | "displayName"
    | "name"
    | "brand"
    | "model"
    | "warrantyCode"
  > & {
    serialNumber: string | null;
    category: Pick<CategorySummary, "id" | "slug" | "name"> | null;
  };
  warranty: Pick<
    WarrantySummary,
    | "warrantyCode"
    | "startDate"
    | "endDate"
    | "durationMonths"
    | "terms"
    | "status"
  >;
  installation: {
    installedAt: string | null;
    vehicleModel: string | null;
    dealer: {
      id: string | null;
      name: string | null;
      phone: string | null;
      address: string | null;
      province: string | null;
      district: string | null;
    } | null;
    filmItems: WarrantyLookupFilmItems | null;
  } | null;
};

export type WarrantyLookupFilmItems = Partial<
  Record<
    | "windshield"
    | "frontLeftSide"
    | "frontRightSide"
    | "rearLeftSide"
    | "rearRightSide"
    | "sunroof"
    | "rearGlass",
    string
  >
>;

export type WarrantyProductSummary = Pick<
  ProductSummary,
  | "id"
  | "name"
  | "displayName"
  | "brand"
  | "model"
  | "modelYear"
  | "productCode"
  | "status"
> & {
  serialNumber: string | null;
  category?: Pick<CategorySummary, "id" | "slug" | "name"> | null;
};

export type WarrantyOwnerSummary = {
  activatedAt?: string | null;
  customerId: string;
  customerCode?: string;
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  purchaseDate?: string | null;
  address?: string | null;
  ownerUserId?: string | null;
};

export type WarrantyListItem = WarrantySummary & {
  activationCode: {
    id: string;
    code: string | null;
    status: ActivationCodeReportStatus;
  } | null;
  owner: WarrantyOwnerSummary | null;
  product: WarrantyProductSummary;
};

export type ListWarrantiesQuery = {
  categoryId?: string;
  claimEligible?: "true" | "false";
  limit?: number;
  page?: number;
  productId?: string;
  search?: string;
  sortBy?: "createdAt" | "endDate" | "startDate" | "updatedAt";
  sortOrder?: "asc" | "desc";
  status?: WarrantyStatus | "ALL";
};

export type LookupWarrantyQuery = {
  code: string;
};

export type ActivateWarrantyBody = {
  startDate?: string;
};

export type ActivateWarrantyByCodeBody = ActivateWarrantyBody & {
  warrantyCode: string;
};

export type UpdateWarrantyBody = {
  adjustmentReason: string;
  coverageLimitAmount?: string | null;
  durationMonths?: number;
  maxAmountPerClaim?: string | null;
  maxClaimCount?: number | null;
  terms?: string | null;
};

export type VoidWarrantyBody = {
  reason: string;
};

export type TransferWarrantyOwnerBody = {
  customerId: string;
  purchaseDate?: string;
};

export type ManualWarrantyActivationCustomerInput = {
  customerId?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

export type ManualWarrantyActivationProductInput = {
  id?: string;
  categoryId?: string;
  name?: string;
  brand?: string;
  model?: string;
  displayName?: string;
};

export type ManualWarrantyActivationWarrantyInput = {
  activatedAt: string;
  durationMonths: number;
  purchaseDate?: string;
  warrantyCode?: string;
  terms?: string;
};

export type ManualWarrantyActivationBody = {
  customer: ManualWarrantyActivationCustomerInput;
  product: ManualWarrantyActivationProductInput;
  warranty: ManualWarrantyActivationWarrantyInput;
};

export type ManualWarrantyActivationResult = {
  customer: {
    id: string;
    customerCode: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  product: Pick<
    ProductSummary,
    "id" | "productCode" | "warrantyCode" | "name" | "brand" | "model"
  > & { serialNumber: string | null };
  warranty: WarrantySummary;
};
