import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type MapTileProvider = {
  attribution: string;
  url: string;
};

export type MapActivationMode = "direct" | "disabled" | "overlay";

export type SharedMapInitialView =
  | {
      initialBounds: LatLngBoundsExpression;
      initialCenter?: never;
      initialZoom?: never;
    }
  | {
      initialBounds?: never;
      initialCenter: LatLngExpression;
      initialZoom: number;
    };
