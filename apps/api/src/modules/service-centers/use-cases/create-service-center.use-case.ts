import { ConflictError } from '@/common/response';
import { CreateServiceCenterDto } from '@/modules/service-centers/dto/create-service-center.dto';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import {
  mapServiceCenterUniqueConflict,
  normalizeServiceCenterEmail,
  normalizeServiceCenterPhone,
} from '@/modules/service-centers/service-centers.utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateServiceCenterUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(dto: CreateServiceCenterDto) {
    const phone = normalizeServiceCenterPhone(dto.phone);
    const email = normalizeServiceCenterEmail(dto.email);

    if (phone && (await this.serviceCentersRepository.findByPhone(phone))) {
      throw new ConflictError('Service center phone already exists');
    }

    if (email && (await this.serviceCentersRepository.findByEmail(email))) {
      throw new ConflictError('Service center email already exists');
    }

    let serviceCenter;
    try {
      serviceCenter = await this.serviceCentersRepository.create({
        name: dto.name.trim(),
        phone,
        email,
        province: dto.province.trim(),
        district: dto.district?.trim(),
        address: dto.address.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
    } catch (error) {
      throw mapServiceCenterUniqueConflict(error) ?? error;
    }

    return toServiceCenterResponse(serviceCenter);
  }
}
