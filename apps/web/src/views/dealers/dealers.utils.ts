import type { GeoPoint, PublicNetworkLocation } from "@repo/shared";
import type { DealerLocation } from "./dealers.types";

export const dealerFilterAll = "all" as const;

export function getNetworkLocationKey(location: PublicNetworkLocation) {
  return `${location.kind}:${location.id}`;
}

type DealerFilters = {
  searchQuery: string;
  selectedDistrict: string;
  selectedProvince: string;
};

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLocaleLowerCase("vi")
    .trim();
}

export function selectDealerLocations(
  locations: readonly PublicNetworkLocation[],
): DealerLocation[] {
  return locations.filter(
    (location): location is DealerLocation => location.kind === "DEALER",
  );
}

export function filterDealerLocations(
  dealers: readonly DealerLocation[],
  filters: DealerFilters,
) {
  const normalizedQuery = normalizeSearchValue(filters.searchQuery);

  return dealers.filter((dealer) => {
    const searchableValues = [
      dealer.name,
      dealer.address,
      dealer.phone ?? "",
      dealer.province,
      dealer.district ?? "",
    ];
    const matchesQuery =
      !normalizedQuery ||
      searchableValues.some((value) =>
        normalizeSearchValue(value).includes(normalizedQuery),
      );
    const matchesProvince =
      filters.selectedProvince === dealerFilterAll ||
      dealer.province === filters.selectedProvince;
    const matchesDistrict =
      filters.selectedDistrict === dealerFilterAll ||
      dealer.district === filters.selectedDistrict;

    return matchesQuery && matchesProvince && matchesDistrict;
  });
}

function sortLocationNames(values: Iterable<string>) {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right, "vi"),
  );
}

export function getDealerProvinces(dealers: readonly DealerLocation[]) {
  return sortLocationNames(dealers.map((dealer) => dealer.province));
}

export function getDealerDistricts(
  dealers: readonly DealerLocation[],
  selectedProvince: string,
) {
  if (selectedProvince === dealerFilterAll) return [];

  return sortLocationNames(
    dealers
      .filter((dealer) => dealer.province === selectedProvince)
      .flatMap((dealer) => (dealer.district ? [dealer.district] : [])),
  );
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceInKilometers(origin: GeoPoint, destination: GeoPoint) {
  const earthRadiusKilometers = 6371;
  const latitudeDelta = degreesToRadians(
    destination.latitude - origin.latitude,
  );
  const longitudeDelta = degreesToRadians(
    destination.longitude - origin.longitude,
  );
  const originLatitude = degreesToRadians(origin.latitude);
  const destinationLatitude = degreesToRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadiusKilometers *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function filterDealerLocationsWithinRadius(
  dealers: readonly DealerLocation[],
  origin: GeoPoint,
  radiusKilometers: number,
) {
  return dealers
    .map((dealer) => ({
      dealer,
      distance: getDistanceInKilometers(origin, dealer),
    }))
    .filter(({ distance }) => distance <= radiusKilometers)
    .sort((left, right) => left.distance - right.distance)
    .map(({ dealer }) => dealer);
}
