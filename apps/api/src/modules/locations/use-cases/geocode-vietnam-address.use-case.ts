import geoapifyConfig from '@/config/geoapify.config';
import { GeoapifyGeocodingClient } from '@/modules/locations/clients/geoapify-geocoding.client';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import type {
  GeocodeVietnamAddressBody,
  GeocodeVietnamAddressCandidate,
} from '@repo/shared';
import { createHash } from 'node:crypto';

@Injectable()
export class GeocodeVietnamAddressUseCase {
  constructor(
    private readonly geocodingClient: GeoapifyGeocodingClient,
    private readonly cacheService: LocationsCacheService,
    @Inject(geoapifyConfig.KEY)
    private readonly config: ConfigType<typeof geoapifyConfig>,
  ) {}

  execute(
    input: GeocodeVietnamAddressBody,
  ): Promise<GeocodeVietnamAddressCandidate[]> {
    const normalized = {
      address: this.normalizeOptional(input.address),
      province: input.province.trim(),
      ward: this.normalizeOptional(input.ward),
    };
    const queryHash = createHash('sha256')
      .update(JSON.stringify(normalized).toLocaleLowerCase('vi'))
      .digest('hex');

    return this.cacheService.remember(
      `locations:geocode:vietnam:${queryHash}`,
      () => this.geocodingClient.geocodeVietnamAddress(normalized),
      this.config.cacheTtlSeconds,
    );
  }

  private normalizeOptional(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }
}
