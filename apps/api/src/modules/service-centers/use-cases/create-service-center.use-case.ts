import { CreateServiceCenterDto } from '@/modules/service-centers/dto/create-service-center.dto';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateServiceCenterUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(dto: CreateServiceCenterDto) {
    const serviceCenter = await this.serviceCentersRepository.create({
      name: dto.name.trim(),
      phone: dto.phone?.trim(),
      email: dto.email?.trim(),
      province: dto.province.trim(),
      district: dto.district?.trim(),
      address: dto.address.trim(),
    });

    return toServiceCenterResponse(serviceCenter);
  }
}
