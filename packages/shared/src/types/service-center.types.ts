import type { PaginationQuery } from "./pagination.types.ts";
import type { GeoPoint, OptionalGeoPoint } from "./geo.types.ts";

export type ServiceCenterSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  province: string;
  district: string | null;
  address: string;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCenterSortBy =
  | "name"
  | "province"
  | "createdAt"
  | "updatedAt"
  | "isActive";

export type ListServiceCentersQuery = Omit<PaginationQuery, "sortBy"> & {
  search?: string;
  province?: string;
  isActive?: "true" | "false";
  sortBy?: ServiceCenterSortBy;
};

export type CreateServiceCenterBody = GeoPoint & {
  name: string;
  phone?: string;
  email?: string;
  province: string;
  district?: string;
  address: string;
};

export type UpdateServiceCenterBody = OptionalGeoPoint &
  Partial<Omit<CreateServiceCenterBody, keyof GeoPoint>> & {
    isActive?: boolean;
  };

export type ServiceCenterImportResult = {
  created: number;
  updated: number;
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
};
