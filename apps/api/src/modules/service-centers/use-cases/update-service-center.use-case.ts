import { NotFoundError } from '@/common/response';
import { UpdateServiceCenterDto } from '@/modules/service-centers/dto/update-service-center.dto';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { toServiceCenterResponse } from '@/modules/service-centers/service-centers.types';
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

    const data: Prisma.ServiceCenterUpdateInput = {
      name: dto.name?.trim(),
      phone: dto.phone?.trim(),
      email: dto.email?.trim(),
      province: dto.province?.trim(),
      district: dto.district?.trim(),
      address: dto.address?.trim(),
      is_active: dto.isActive,
    };
    const serviceCenter = await this.serviceCentersRepository.update(id, data);

    return toServiceCenterResponse(serviceCenter);
  }
}
