import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

  list(filters: ListDealersDto) {
    const search = filters.search?.trim();
    const province = filters.province?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
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
