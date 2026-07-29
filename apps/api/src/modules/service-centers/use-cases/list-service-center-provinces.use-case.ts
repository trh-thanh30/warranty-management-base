import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListServiceCenterProvincesUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute() {
    const provinces = await this.serviceCentersRepository.listProvinces();

    return provinces.map(({ province }) => province);
  }
}
