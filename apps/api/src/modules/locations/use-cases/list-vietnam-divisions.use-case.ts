import { VietnamProvincesClient } from '@/modules/locations/clients/vietnam-provinces.client';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListVietnamDivisionsUseCase {
  constructor(
    private readonly provincesClient: VietnamProvincesClient,
    private readonly cacheService: LocationsCacheService,
  ) {}

  execute(depth = 1) {
    return this.cacheService.remember(
      `locations:vietnam:divisions:depth=${depth}`,
      () => this.provincesClient.listDivisions(depth),
    );
  }
}
