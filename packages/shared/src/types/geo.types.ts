export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type OptionalGeoPoint =
  | GeoPoint
  | {
      latitude?: never;
      longitude?: never;
    };

export type PublicNetworkLocationKind = "DEALER" | "SERVICE_CENTER";

export type PublicNetworkLocation = GeoPoint & {
  address: string;
  district: string | null;
  googleMapsUrl: string;
  id: string;
  kind: PublicNetworkLocationKind;
  name: string;
  phone: string | null;
  province: string;
};

export type PublicDealerLocation = PublicNetworkLocation & {
  kind: "DEALER";
};

export type ListPublicDealersQuery = {
  district?: string;
  latitude?: number;
  limit?: number;
  longitude?: number;
  page?: number;
  province?: string;
  radiusKm?: number;
  search?: string;
};

export type PublicDealerFilterOptions = {
  districts: string[];
  provinces: string[];
};

export type ListPublicNetworkDirectoryQuery = {
  district?: string;
  latitude?: number;
  limit?: number;
  longitude?: number;
  page?: number;
  province?: string;
  radiusKm?: number;
  search?: string;
};

export type PublicNetworkDirectoryFilterOptions = {
  districts: string[];
  provinces: string[];
};

export type GeocodeVietnamAddressBody = {
  address?: string;
  province: string;
  ward?: string;
};

export type GeocodeVietnamAddressCandidate = GeoPoint & {
  confidence?: number;
  formattedAddress: string;
  resultType?: string;
};
