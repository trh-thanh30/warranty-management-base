import { ConflictError, NotFoundError } from '@/common/response';
import { UpdateServiceCenterDto } from '@/modules/service-centers/dto/update-service-center.dto';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
import {
  mapServiceCenterUniqueConflict,
  normalizeServiceCenterEmail,
  normalizeServiceCenterPhone,
} from '@/modules/service-centers/service-centers.utils';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UpdateServiceCenterUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(id: string, dto: UpdateServiceCenterDto) {
    const existingServiceCenter =
      await this.serviceCentersRepository.findById(id);

    if (!existingServiceCenter) {
      throw new NotFoundError('Service center not found');
    }

    const phone = normalizeServiceCenterPhone(dto.phone);
    const email = normalizeServiceCenterEmail(dto.email);

    if (phone && (await this.serviceCentersRepository.findByPhone(phone, id))) {
      throw new ConflictError('Service center phone already exists');
    }

    if (email && (await this.serviceCentersRepository.findByEmail(email, id))) {
      throw new ConflictError('Service center email already exists');
    }

    const data: Prisma.ServiceCenterUpdateInput = {
      name: dto.name?.trim(),
      phone,
      email,
      province: dto.province?.trim(),
      district: dto.district?.trim(),
      address: dto.address?.trim(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      is_active: dto.isActive,
    };
    let serviceCenter;
    try {
      serviceCenter = await this.serviceCentersRepository.update(id, data);
    } catch (error) {
      throw mapServiceCenterUniqueConflict(error) ?? error;
    }

    return toServiceCenterResponse(serviceCenter);
  }
}
