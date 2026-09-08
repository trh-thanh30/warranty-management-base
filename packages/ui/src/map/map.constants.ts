import type { MapTileProvider } from "./map.types";

export const MAP_MARKER_COLORS = {
  dealer: "#dc2626",
  serviceCenter: "#2563eb",
} as const;

export const OPEN_STREET_MAP_TILE_PROVIDER: MapTileProvider = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  url: "https://map.ssit.company/osm/{z}/{x}/{y}.png",
};
