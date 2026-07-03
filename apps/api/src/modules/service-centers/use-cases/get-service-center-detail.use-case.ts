import { NotFoundError } from '@/common/response';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetServiceCenterDetailUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(id: string) {
    const serviceCenter = await this.serviceCentersRepository.findById(id);

    if (!serviceCenter) {
      throw new NotFoundError('Service center not found');
    }

    return toServiceCenterResponse(serviceCenter);
  }
}
