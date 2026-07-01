import type { ProductSummary } from "./product.types.js";

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
