import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicListServiceCentersUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(query: { search?: string; province?: string }) {
    const serviceCenters = await this.serviceCentersRepository.list({
      search: query.search,
      province: query.province,
      isActive: 'true',
    });

    return serviceCenters.map(toServiceCenterResponse);
  }
}
