import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { ListCustomersDto } from '@/modules/customers/dto/list-customers.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

function buildCustomerOrderBy(
  sortBy?: keyof Prisma.CustomerOrderByWithRelationInput,
  sortOrder: 'asc' | 'desc' = 'desc',
): Prisma.CustomerOrderByWithRelationInput[] {
  if (!sortBy) return [{ created_at: 'desc' }, { id: 'desc' }];

  const orderBy = [
    { [sortBy]: sortOrder },
  ] as Prisma.CustomerOrderByWithRelationInput[];

  if (sortBy !== 'created_at') orderBy.push({ created_at: 'desc' });

  orderBy.push({ id: 'desc' });
  return orderBy;
}

function buildCustomerWhere(
  filters: ListCustomersDto,
): Prisma.CustomerWhereInput {
  const trimmedSearch = filters.search?.trim();
  const status = filters.status ?? 'ACTIVE';
  const statusFilter: Prisma.CustomerWhereInput =
    status === 'ALL'
      ? {}
      : { deleted_at: status === 'DELETED' ? { not: null } : null };

  return {
    ...statusFilter,
    ...(trimmedSearch
      ? {
          OR: [
            { customer_code: { contains: trimmedSearch, mode: 'insensitive' } },
            { full_name: { contains: trimmedSearch, mode: 'insensitive' } },
            { phone: { contains: trimmedSearch, mode: 'insensitive' } },
            { email: { contains: trimmedSearch, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUserById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

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

  findLastCustomerCode(prefix: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prismaService;

    return client.customer.findFirst({
      where: {
        customer_code: {
          startsWith: prefix,
        },
      },
      orderBy: { customer_code: 'desc' },
      select: { customer_code: true },
    });
  }

  findByPhone(phone: string, excludeId?: string) {
    return this.prismaService.customer.findFirst({
      where: {
        phone,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
  }

  findByEmail(email: string, excludeId?: string) {
    return this.prismaService.customer.findFirst({
      where: {
        email,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
  }

  list(filters: ListCustomersDto) {
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
    const where = buildCustomerWhere(filters);
    const orderBy = buildCustomerOrderBy(sortBy, filters.sortOrder);

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

  listForExport(filters: ListCustomersDto) {
    const where = buildCustomerWhere(filters);

    return this.prismaService.customer.findMany({
      where,
      orderBy: buildCustomerOrderBy(),
      take: 5000,
    });
  }

  update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.prismaService.customer.update({
      where: { id },
      data,
    });
  }
}
