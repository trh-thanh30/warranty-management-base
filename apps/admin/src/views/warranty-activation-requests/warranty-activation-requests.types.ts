import type {
  WarrantyActivationRequestSortBy,
  WarrantyActivationRequestStatus,
  WarrantyActivationRequestSummary,
} from "@repo/shared";

export type WarrantyActivationRequestStatusFilter =
  | "ALL"
  | WarrantyActivationRequestStatus;

export type WarrantyActivationRequestDirectoryFilters = {
  dateFrom: string;
  dateTo: string;
  status: WarrantyActivationRequestStatusFilter;
  warrantyCode: string;
};

export type WarrantyActivationRequestSort = WarrantyActivationRequestSortBy;

export type WarrantyActivationRequestAction = "approve" | "detail" | "reject";

export type WarrantyActivationRequestCreateFormValues = {
  addressDetail: string;
  customerBirthdate: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  note: string;
  productId: string;
  productName: string;
  provinceCode: string;
  wardCode: string;
  warrantyCode: string;
};

export type SelectedWarrantyActivationRequest =
  WarrantyActivationRequestSummary | null;
