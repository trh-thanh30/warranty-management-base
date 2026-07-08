import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicListServiceCentersUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(query: {
    search?: string;
    province?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const result = await this.serviceCentersRepository.list({
      search: query.search,
      province: query.province,
      isActive: 'true',
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items: result.items.map(toServiceCenterResponse),
      meta: result.meta,
    };
  }
}
