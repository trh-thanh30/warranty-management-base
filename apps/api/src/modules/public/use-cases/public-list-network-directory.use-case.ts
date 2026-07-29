import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { Injectable } from '@nestjs/common';
import type {
  ListPublicNetworkDirectoryQuery,
  PaginatedResponse,
  PublicNetworkLocation,
  PublicNetworkLocationKind,
} from '@repo/shared';
import { createGoogleMapsUrl } from '@repo/shared/utils';

type NetworkRecord = Omit<PublicNetworkLocation, 'googleMapsUrl' | 'kind'>;

@Injectable()
export class PublicListNetworkDirectoryUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(
    query: ListPublicNetworkDirectoryQuery,
  ): Promise<PaginatedResponse<PublicNetworkLocation>> {
    const [dealers, serviceCenters] = await Promise.all([
      this.dealersRepository.listActiveForNetwork(),
      this.serviceCentersRepository.listActiveForNetwork(),
    ]);
    const search = normalizeSearch(query.search ?? '');
    const province = normalizeSearch(query.province ?? '');
    const district = normalizeSearch(query.district ?? '');
    const hasCoordinates =
      query.latitude !== undefined && query.longitude !== undefined;
    const radiusKm = query.radiusKm ?? 20;
    const locations = [
      ...dealers.map((dealer) => mapLocation(dealer, 'DEALER')),
      ...serviceCenters.map((center) => mapLocation(center, 'SERVICE_CENTER')),
    ]
      .filter(
        (location) =>
          (!province || normalizeSearch(location.province) === province) &&
          (!district ||
            normalizeSearch(location.district ?? '') === district) &&
          (!search ||
            [
              location.name,
              location.address,
              location.phone ?? '',
              location.province,
              location.district ?? '',
            ].some((value) => normalizeSearch(value).includes(search))),
      )
      .map((location) => ({
        distance:
          hasCoordinates &&
          query.latitude !== undefined &&
          query.longitude !== undefined
            ? distanceInKilometers(
                {
                  latitude: query.latitude,
                  longitude: query.longitude,
                },
                location,
              )
            : null,
        location,
      }))
      .filter(({ distance }) => distance === null || distance <= radiusKm)
      .sort((left, right) => {
        if (left.distance !== null && right.distance !== null) {
          return (
            left.distance - right.distance ||
            compareLocations(left.location, right.location)
          );
        }

        return compareLocations(left.location, right.location);
      });
    const { page, limit, skip, take } = normalizePagination(query);
    const items = locations
      .slice(skip, skip + take)
      .map(({ location }) => location);

    return paginate(items, { page, limit, total: locations.length });
  }
}

function mapLocation(
  record: NetworkRecord,
  kind: PublicNetworkLocationKind,
): PublicNetworkLocation {
  return {
    ...record,
    kind,
    googleMapsUrl: createGoogleMapsUrl(record),
  };
}

function compareLocations(
  left: PublicNetworkLocation,
  right: PublicNetworkLocation,
) {
  return (
    left.province.localeCompare(right.province, 'vi') ||
    left.name.localeCompare(right.name, 'vi') ||
    left.kind.localeCompare(right.kind) ||
    left.id.localeCompare(right.id)
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .toLocaleLowerCase('vi')
    .trim();
}

function distanceInKilometers(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) {
  const radius = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 * radius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}
