import { ListVietnamProvincesDto } from '@/modules/locations/dto/list-vietnam-provinces.dto';
import { VietnamProvincesClient } from '@/modules/locations/clients/vietnam-provinces.client';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListVietnamProvincesUseCase {
  constructor(
    private readonly provincesClient: VietnamProvincesClient,
    private readonly cacheService: LocationsCacheService,
  ) {}

  execute(query: ListVietnamProvincesDto) {
    const search = query.search?.trim() ?? '';

    return this.cacheService.remember(
      `locations:vietnam:provinces:search=${search}`,
      () => this.provincesClient.listProvinces(search),
    );
  }
}
