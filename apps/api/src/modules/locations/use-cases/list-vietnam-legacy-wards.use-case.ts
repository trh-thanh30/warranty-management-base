import { VietnamProvincesClient } from '@/modules/locations/clients/vietnam-provinces.client';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListVietnamLegacyWardsUseCase {
  constructor(
    private readonly provincesClient: VietnamProvincesClient,
    private readonly cacheService: LocationsCacheService,
  ) {}

  execute(code: number) {
    return this.cacheService.remember(
      `locations:vietnam:ward:${code}:legacies`,
      () => this.provincesClient.listLegacyWards(code),
    );
  }
}
