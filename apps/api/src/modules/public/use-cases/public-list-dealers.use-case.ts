import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { Injectable } from '@nestjs/common';
import type {
  ListPublicDealersQuery,
  PaginatedResponse,
  PublicDealerLocation,
} from '@repo/shared';
import { createGoogleMapsUrl } from '@repo/shared/utils';

type PublicDealerRecord = {
  address: string;
  district: string | null;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  phone: string | null;
  province: string;
};

@Injectable()
export class PublicListDealersUseCase {
  constructor(private readonly dealersRepository: DealersRepository) {}

  async execute(
    query: ListPublicDealersQuery,
  ): Promise<PaginatedResponse<PublicDealerLocation>> {
    if (query.latitude !== undefined && query.longitude !== undefined) {
      return this.listNearby({
        ...query,
        latitude: query.latitude,
        longitude: query.longitude,
      });
    }

    const result = await this.dealersRepository.listActivePublic(query);

    return {
      ...result,
      items: result.items
        .filter(hasCoordinates)
        .map((dealer) => this.mapDealer(dealer)),
    };
  }

  private async listNearby(
    query: ListPublicDealersQuery & {
      latitude: number;
      longitude: number;
    },
  ): Promise<PaginatedResponse<PublicDealerLocation>> {
    const dealers = (
      await this.dealersRepository.listActiveForNetwork()
    ).filter(hasCoordinates);
    const search = normalizeSearch(query.search ?? '');
    const radiusKm = query.radiusKm ?? 20;
    const filtered = dealers
      .filter(
        (dealer) =>
          (!query.province || dealer.province === query.province) &&
          (!query.district || dealer.district === query.district) &&
          (!search ||
            [
              dealer.name,
              dealer.address,
              dealer.phone ?? '',
              dealer.province,
              dealer.district ?? '',
            ].some((value) => normalizeSearch(value).includes(search))),
      )
      .map((dealer) => ({
        dealer,
        distance: distanceInKilometers(
          { latitude: query.latitude, longitude: query.longitude },
          dealer,
        ),
      }))
      .filter(({ distance }) => distance <= radiusKm)
      .sort(
        (left, right) =>
          left.distance - right.distance ||
          left.dealer.name.localeCompare(right.dealer.name, 'vi'),
      );
    const { page, limit, skip, take } = normalizePagination(query);
    const items = filtered
      .slice(skip, skip + take)
      .map(({ dealer }) => this.mapDealer(dealer));

    return paginate(items, { page, limit, total: filtered.length });
  }

  private mapDealer(dealer: PublicDealerRecord): PublicDealerLocation {
    return {
      ...dealer,
      kind: 'DEALER',
      googleMapsUrl: createGoogleMapsUrl(dealer),
    };
  }
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

function hasCoordinates<
  T extends { latitude: number | null; longitude: number | null },
>(record: T): record is T & { latitude: number; longitude: number } {
  return record.latitude !== null && record.longitude !== null;
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
