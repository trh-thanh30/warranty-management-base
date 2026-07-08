import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { ListCustomersDto } from '@/modules/customers/dto/list-customers.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.CustomerCreateInput) {
    return this.prismaService.customer.create({ data });
  }

  findById(id: string) {
    return this.prismaService.customer.findUnique({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.prismaService.customer.findUnique({
      where: { user_id: userId },
    });
  }

  findByCustomerCode(customerCode: string) {
    return this.prismaService.customer.findUnique({
      where: { customer_code: customerCode },
    });
  }

  list(filters: ListCustomersDto) {
    const trimmedSearch = filters.search?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      customerCode: 'customer_code',
      fullName: 'full_name',
      phone: 'phone',
      email: 'email',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.CustomerOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.CustomerWhereInput = trimmedSearch
      ? {
          OR: [
            {
              customer_code: { contains: trimmedSearch, mode: 'insensitive' },
            },
            { full_name: { contains: trimmedSearch, mode: 'insensitive' } },
            { phone: { contains: trimmedSearch, mode: 'insensitive' } },
            { email: { contains: trimmedSearch, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy: Prisma.CustomerOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.customer.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        tx.customer.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.prismaService.customer.update({
      where: { id },
      data,
    });
  }
}
