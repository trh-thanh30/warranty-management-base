import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListServiceCentersUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(filters: ListServiceCentersDto) {
    const result = await this.serviceCentersRepository.list(filters);

    return {
      items: result.items.map(toServiceCenterResponse),
      meta: result.meta,
    };
  }
}
