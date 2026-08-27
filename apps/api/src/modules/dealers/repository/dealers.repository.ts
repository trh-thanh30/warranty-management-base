import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { ListDealerActivatedCustomersDto } from '@/modules/dealers/dto/list-dealer-activated-customers.dto';
import { PreparedDealerImportRow } from '@/modules/dealers/excel/dealer-excel.types';
import { Injectable } from '@nestjs/common';
import { resolveActiveFilter } from '@/common/helpers/active-filter.helper';
import { Prisma } from '@prisma/client';
import type { ListPublicDealersQuery } from '@repo/shared';

@Injectable()
export class DealersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: string) {
    return this.prismaService.dealer.findUnique({ where: { id } });
  }

  findActiveById(id: string) {
    return this.prismaService.dealer.findFirst({
      where: { id, is_active: true },
    });
  }

  findByPhone(phone: string, excludeId?: string) {
    return this.prismaService.dealer.findFirst({
      where: {
        phone,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
  }

  listProvinces() {
    return this.prismaService.dealer.findMany({
      distinct: ['province'],
      orderBy: { province: 'asc' },
      select: { province: true },
    });
  }

  list(filters: ListDealersDto) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const isActive = resolveActiveFilter(filters.isActive);
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      createdAt: 'created_at',
      name: 'name',
      province: 'province',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.DealerOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.DealerWhereInput = {
      is_active: isActive,
      province: province
        ? { contains: province, mode: 'insensitive' }
        : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { province: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { sales_name: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const orderBy: Prisma.DealerOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ is_active: 'desc' }, { province: 'asc' }, { name: 'asc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.dealer.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        tx.dealer.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listActivatedCustomers(
    dealerId: string,
    filters: ListDealerActivatedCustomersDto,
  ) {
    const search = filters.search?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.WarrantyActivationRequestWhereInput = {
      dealer_id: dealerId,
      status: 'ACTIVATED',
      customer_id: { not: null },
      activated_warranty_id: { not: null },
      activated_warranty: filters.warrantyStatus
        ? { is: { status: filters.warrantyStatus } }
        : undefined,
      OR: search
        ? [
            { customer_name: { contains: search, mode: 'insensitive' } },
            { customer_phone: { contains: search, mode: 'insensitive' } },
            { customer_email: { contains: search, mode: 'insensitive' } },
            { warranty_code: { contains: search, mode: 'insensitive' } },
            { product_name: { contains: search, mode: 'insensitive' } },
            { serial_number: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.warrantyActivationRequest.findMany({
          where,
          orderBy: { reviewed_at: 'desc' },
          skip,
          take,
          select: {
            id: true,
            reviewed_at: true,
            customer: {
              select: {
                id: true,
                full_name: true,
                phone: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                display_name: true,
                product_code: true,
                serial_number: true,
              },
            },
            activated_warranty: {
              select: {
                id: true,
                warranty_code: true,
                status: true,
                start_date: true,
                end_date: true,
                duration_months: true,
              },
            },
          },
        }),
        tx.warrantyActivationRequest.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listAll() {
    return this.prismaService.dealer.findMany();
  }

  listActiveForNetwork() {
    return this.prismaService.dealer.findMany({
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

  listActivePublic(filters: ListPublicDealersQuery) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const district = filters.district?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.DealerWhereInput = {
      is_active: true,
      province: province
        ? { equals: province, mode: 'insensitive' }
        : undefined,
      district: district
        ? { equals: district, mode: 'insensitive' }
        : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { province: { contains: search, mode: 'insensitive' } },
            { district: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const select = {
      id: true,
      name: true,
      phone: true,
      address: true,
      province: true,
      district: true,
      latitude: true,
      longitude: true,
    } satisfies Prisma.DealerSelect;

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.dealer.findMany({
          where,
          orderBy: [{ province: 'asc' }, { name: 'asc' }, { id: 'asc' }],
          select,
          skip,
          take,
        }),
        tx.dealer.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listActiveFilterOptions(province?: string): Promise<{
    districts: Array<{ district: string | null }>;
    provinces: Array<{ province: string }>;
  }> {
    return this.prismaService.$transaction(async (tx) => {
      const [provinces, districts] = await Promise.all([
        tx.dealer.findMany({
          distinct: ['province'],
          orderBy: { province: 'asc' },
          select: { province: true },
          where: { is_active: true },
        }),
        province
          ? tx.dealer.findMany({
              distinct: ['district'],
              orderBy: { district: 'asc' },
              select: { district: true },
              where: {
                is_active: true,
                province: { equals: province, mode: 'insensitive' },
                district: { not: null },
              },
            })
          : Promise.resolve([]),
      ]);

      return { provinces, districts };
    });
  }

  listForExport(filters: ListDealersDto) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const isActive = resolveActiveFilter(filters.isActive);
    const sortMap = {
      createdAt: 'created_at',
      name: 'name',
      province: 'province',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.DealerOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.DealerWhereInput = {
      is_active: isActive,
      province: province
        ? { contains: province, mode: 'insensitive' }
        : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { province: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { sales_name: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const orderBy: Prisma.DealerOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ is_active: 'desc' }, { province: 'asc' }, { name: 'asc' }];

    return this.prismaService.dealer.findMany({
      where,
      orderBy,
      take: 5000,
    });
  }

  importRows(rows: PreparedDealerImportRow[]) {
    return this.prismaService.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;

      for (const row of rows) {
        const data = {
          address: row.address,
          is_active: row.isActive,
          name: row.name,
          phone: row.phone,
          province: row.province,
          district: row.district,
          latitude: row.latitude,
          longitude: row.longitude,
          sales_name: row.salesName,
        };

        if (row.existingDealerId) {
          await tx.dealer.update({
            where: { id: row.existingDealerId },
            data,
          });
          updated += 1;
        } else {
          await tx.dealer.create({ data });
          created += 1;
        }
      }

      return { created, updated };
    });
  }

  create(data: Prisma.DealerCreateInput) {
    return this.prismaService.dealer.create({ data });
  }

  update(id: string, data: Prisma.DealerUpdateInput) {
    return this.prismaService.dealer.update({
      where: { id },
      data,
    });
  }
}
