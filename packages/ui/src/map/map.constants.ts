import type { MapTileProvider } from "./map.types";

export const OPEN_STREET_MAP_TILE_PROVIDER: MapTileProvider = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
};
