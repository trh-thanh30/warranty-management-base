import type { ProductSummary } from "./product.types.ts";

export type WarrantyStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "VOIDED";

export type WarrantySummary = {
  id: string;
  productId: string;
  warrantyCode: string;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number;
  status: WarrantyStatus;
  terms: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type WarrantyLookupResult = {
  product: Pick<
    ProductSummary,
    "id" | "name" | "brand" | "model" | "serialNumber" | "warrantyCode"
  >;
  warranty: Pick<
    WarrantySummary,
    "warrantyCode" | "startDate" | "endDate" | "status"
  >;
};

export type WarrantyProductSummary = Pick<
  ProductSummary,
  "id" | "name" | "brand" | "model" | "productCode" | "serialNumber"
>;

export type WarrantyOwnerSummary = {
  customerId: string;
  customerCode?: string;
  fullName?: string;
  ownerUserId?: string | null;
};

export type WarrantyListItem = WarrantySummary & {
  owner: WarrantyOwnerSummary | null;
  product: WarrantyProductSummary;
};

export type ListWarrantiesQuery = {
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: "createdAt" | "endDate" | "startDate" | "updatedAt";
  sortOrder?: "asc" | "desc";
  status?: WarrantyStatus;
};

export type LookupWarrantyQuery = {
  code: string;
};

export type ActivateWarrantyBody = {
  durationMonths?: number;
  startDate?: string;
  terms?: string;
};

export type ActivateWarrantyByCodeBody = ActivateWarrantyBody & {
  warrantyCode: string;
};
