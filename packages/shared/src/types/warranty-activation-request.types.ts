import type { PaginationQuery } from "./pagination.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";

export type WarrantyActivationRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVATED"
  | "CANCELLED";

export type WarrantyActivationRequestSource = "PUBLIC_WEB" | "ADMIN_PORTAL";

export type WarrantyCertificateStatus = "PENDING" | "GENERATED" | "FAILED";

export type WarrantyCertificateEmailStatus =
  | "PENDING"
  | "QUEUED"
  | "SENT"
  | "FAILED";

export type WarrantyCertificateSummary = {
  id: string;
  scope: "ACTIVATION_REQUEST";
  certificateNumber: string;
  downloadUrl: string;
  status: WarrantyCertificateStatus;
  storageKey: string | null;
  viewUrl: string;
  recipientEmail: string | null;
  generatedAt: string | null;
  emailedAt: string | null;
  emailStatus: WarrantyCertificateEmailStatus;
  lastError: string | null;
};

export type WarrantyActivationRequestItemSummary = {
  id: string;
  activationCodeId: string | null;
  activationFieldId: string | null;
  positionKey: string;
  positionLabel: string;
  productId: string;
  productName: string;
  productCode: string;
  serialNumber: string | null;
  warrantyId: string | null;
  warrantyCode: string | null;
  warrantyStatus: WarrantyStatus | null;
  status: WarrantyActivationRequestStatus;
  activatedAt: string | null;
};

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
  source: WarrantyActivationRequestSource;
  warrantyCode: string;
  activationCode: {
    id: string;
    status:
      | "AVAILABLE"
      | "ACTIVATED"
      | "EXPIRED"
      | "REVOKED"
      | "REPLACED"
      | "PENDING_APPROVAL";
  } | null;
  categoryId: string | null;
  productId: string | null;
  dealerId: string | null;
  dealer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string;
    province: string;
    district: string | null;
    salesName: string | null;
  } | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerBirthdate: string | null;
  vehiclePlate: string | null;
  vehicleModel: string | null;
  installedAt: string | null;
  warrantyDurationMonths: number | null;
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
  createdById: string | null;
  createdBy: {
    id: string;
    displayName: string;
    email: string;
    username: string;
  } | null;
  customerId: string | null;
  customer: {
    id: string;
    customerCode: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  } | null;
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
  certificate: WarrantyCertificateSummary | null;
  /** Optional while API consumers migrate from singular product fields. */
  items?: WarrantyActivationRequestItemSummary[];
  /** Optional while API consumers migrate from singular product fields. */
  itemCount?: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWarrantyActivationRequestItemBody = {
  activationCodeId?: string;
  activationFieldId?: string;
  positionKey: string;
  productId: string;
};

export type CreateWarrantyActivationRequestBody = {
  activationCode?: string;
  activationCodeId?: string;
  warrantyCode?: string;
  categoryId?: string;
  productId?: string;
  dealerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  /** Admin-only date value in YYYY-MM-DD format when supplied. */
  customerBirthdate?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  installedAt?: string;
  warrantyDurationMonths?: number;
  dealerName?: string;
  dealerPhone?: string;
  dealerAddress?: string;
  dealerProvince?: string;
  dealerDistrict?: string;
  dealerLatitude?: number;
  dealerLongitude?: number;
  salesName?: string;
  filmItems?: {
    windshield?: string;
    frontLeftSide?: string;
    frontRightSide?: string;
    rearLeftSide?: string;
    rearRightSide?: string;
    sunroof?: string;
    rearGlass?: string;
  };
  metadata?: Record<string, unknown>;
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

export type CreatePublicWarrantyActivationRequestBody = {
  activationCode: string;
  addressDetail: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  vehiclePlate?: string;
};

export type PublicWarrantyActivationRequestReceipt = {
  requestCode: string;
  status: WarrantyActivationRequestStatus;
  createdAt: string;
};

export type CreateAdminWarrantyActivationRequestBody = Omit<
  CreateWarrantyActivationRequestBody,
  "warrantyCode"
> & {
  customerId: string;
  activationCodeId?: string;
  /** Multi-product requests use items; productId remains for legacy clients. */
  items?: CreateWarrantyActivationRequestItemBody[];
  productId?: string;
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
  locale?: "vi" | "en";
};
