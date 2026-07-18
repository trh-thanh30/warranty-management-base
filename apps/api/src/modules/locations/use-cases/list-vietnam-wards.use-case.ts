import { ListVietnamWardsDto } from '@/modules/locations/dto/list-vietnam-wards.dto';
import { VietnamProvincesClient } from '@/modules/locations/clients/vietnam-provinces.client';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListVietnamWardsUseCase {
  constructor(
    private readonly provincesClient: VietnamProvincesClient,
    private readonly cacheService: LocationsCacheService,
  ) {}

  execute(query: ListVietnamWardsDto) {
    const province = query.province ?? 0;
    const search = query.search?.trim() ?? '';

    return this.cacheService.remember(
      `locations:vietnam:wards:province=${province}:search=${search}`,
      () => this.provincesClient.listWards(province, search),
    );
  }
}
