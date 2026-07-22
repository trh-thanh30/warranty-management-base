import type { PaginationQuery } from "./pagination.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";

export type WarrantyActivationRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVATED"
  | "CANCELLED";

export type WarrantyActivationRequestSortBy =
  | "requestCode"
  | "warrantyCode"
  | "customerName"
  | "customerPhone"
  | "status"
  | "reviewedAt"
  | "createdAt"
  | "updatedAt";

export type WarrantyActivationRequestSummary = {
  id: string;
  requestCode: string;
  status: WarrantyActivationRequestStatus;
  warrantyCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerBirthdate: string | null;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
  fullAddress: string;
  productName: string | null;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  note: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedBy: {
    id: string;
    displayName: string;
    email: string;
    username: string;
  } | null;
  reviewedAt: string | null;
  activatedWarrantyId: string | null;
  activatedWarranty: {
    id: string;
    warrantyCode: string;
    status: WarrantyStatus;
    startDate: string | null;
    endDate: string | null;
    durationMonths: number;
  } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWarrantyActivationRequestBody = {
  warrantyCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerBirthdate?: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  addressDetail: string;
  productName?: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  note?: string;
};

export type CreateAdminWarrantyActivationRequestBody = Omit<
  CreateWarrantyActivationRequestBody,
  "warrantyCode"
> & {
  productId: string;
};

export type ListWarrantyActivationRequestsQuery = PaginationQuery & {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: WarrantyActivationRequestSortBy;
  status?: WarrantyActivationRequestStatus;
  warrantyCode?: string;
};

export type ReviewWarrantyActivationRequestBody = {
  status: Extract<WarrantyActivationRequestStatus, "APPROVED" | "REJECTED">;
  adminNote?: string;
  rejectionReason?: string;
};
