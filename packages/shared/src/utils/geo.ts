import type { GeoPoint } from "../types/geo.types.ts";

export function createGoogleMapsUrl({ latitude, longitude }: GeoPoint): string {
  const query = encodeURIComponent(`${latitude},${longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
