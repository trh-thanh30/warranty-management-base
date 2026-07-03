import { PrismaService } from '@/database/prisma/prisma.service';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServiceCentersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: string) {
    return this.prismaService.serviceCenter.findUnique({
      where: { id },
    });
  }

  list(filters: ListServiceCentersDto) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';

    return this.prismaService.serviceCenter.findMany({
      where: {
        is_active: isActive,
        province: province
          ? { contains: province, mode: 'insensitive' }
          : undefined,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { province: { contains: search, mode: 'insensitive' } },
              { district: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: [{ is_active: 'desc' }, { province: 'asc' }, { name: 'asc' }],
    });
  }

  create(data: Prisma.ServiceCenterCreateInput) {
    return this.prismaService.serviceCenter.create({ data });
  }

  update(id: string, data: Prisma.ServiceCenterUpdateInput) {
    return this.prismaService.serviceCenter.update({
      where: { id },
      data,
    });
  }
}
