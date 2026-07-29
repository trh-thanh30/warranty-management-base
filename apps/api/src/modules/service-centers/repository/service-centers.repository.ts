import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { PreparedServiceCenterImportRow } from '@/modules/service-centers/excel/service-center-excel.types';
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

  findByPhone(phone: string, excludeId?: string) {
    return this.prismaService.serviceCenter.findFirst({
      where: {
        phone,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
  }

  findByEmail(email: string, excludeId?: string) {
    return this.prismaService.serviceCenter.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
  }

  listProvinces() {
    return this.prismaService.serviceCenter.findMany({
      distinct: ['province'],
      orderBy: { province: 'asc' },
      select: { province: true },
    });
  }

  list(filters: ListServiceCentersDto) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      name: 'name',
      province: 'province',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      isActive: 'is_active',
    } satisfies Record<
      string,
      keyof Prisma.ServiceCenterOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ServiceCenterWhereInput = {
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
    };
    const orderBy: Prisma.ServiceCenterOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ is_active: 'desc' }, { province: 'asc' }, { name: 'asc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.serviceCenter.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        tx.serviceCenter.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listAll() {
    return this.prismaService.serviceCenter.findMany();
  }

  listActiveForNetwork() {
    return this.prismaService.serviceCenter.findMany({
      where: { is_active: true },
      orderBy: [{ province: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        province: true,
        district: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  listForExport(filters: ListServiceCentersDto) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
    const sortMap = {
      name: 'name',
      province: 'province',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      isActive: 'is_active',
    } satisfies Record<
      string,
      keyof Prisma.ServiceCenterOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ServiceCenterWhereInput = {
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
    };
    const orderBy: Prisma.ServiceCenterOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ is_active: 'desc' }, { province: 'asc' }, { name: 'asc' }];

    return this.prismaService.serviceCenter.findMany({
      where,
      orderBy,
      take: 5000,
    });
  }

  importRows(rows: PreparedServiceCenterImportRow[]) {
    return this.prismaService.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;

      for (const row of rows) {
        const data = {
          name: row.name,
          phone: row.phone,
          email: row.email,
          province: row.province,
          district: row.district,
          address: row.address,
          latitude: row.latitude,
          longitude: row.longitude,
          is_active: row.isActive,
        };

        if (row.existingServiceCenterId) {
          await tx.serviceCenter.update({
            where: { id: row.existingServiceCenterId },
            data,
          });
          updated += 1;
        } else {
          await tx.serviceCenter.create({ data });
          created += 1;
        }
      }

      return { created, updated };
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
