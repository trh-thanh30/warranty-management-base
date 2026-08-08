import type { PaginationQuery } from "./pagination.types.ts";
import type { WarrantyStatus } from "./warranty.types.ts";
import type { GeoPoint, OptionalGeoPoint } from "./geo.types.ts";

export type DealerSortBy = "name" | "province" | "createdAt" | "updatedAt";

export type DealerSummary = {
  id: string;
  name: string;
  phone: string | null;
  address: string;
  province: string;
  district: string | null;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  salesName: string | null;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type DealerResponse = DealerSummary;

export type DealerActivatedCustomerSummary = {
  id: string;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
  };
  product: {
    id: string | null;
    name: string | null;
    productCode: string | null;
    serialNumber: string | null;
  };
  warranty: {
    id: string;
    warrantyCode: string;
    status: WarrantyStatus;
    startDate: string | null;
    endDate: string | null;
    durationMonths: number;
  };
  activatedAt: string | null;
};

export type ListDealerActivatedCustomersQuery = PaginationQuery & {
  search?: string;
  warrantyStatus?: WarrantyStatus;
};

export type ListDealersQuery = PaginationQuery & {
  search?: string;
  province?: string;
  isActive?: string;
  sortBy?: DealerSortBy;
  sortOrder?: "asc" | "desc";
};

export type CreateDealerBody = GeoPoint & {
  name: string;
  phone?: string;
  address: string;
  province: string;
  district?: string;
  salesName?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateDealerBody = OptionalGeoPoint & {
  address?: string;
  district?: string | null;
  isActive?: boolean;
  metadata?: Record<string, unknown> | null;
  name?: string;
  phone?: string | null;
  province?: string;
  salesName?: string | null;
};

export type DealerImportResult = {
  created: number;
  updated: number;
  errors: Array<{
    field: string;
    message: string;
    rowNumber: number;
  }>;
};
