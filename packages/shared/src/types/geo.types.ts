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
