import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_status } from '@prisma/client';

const warrantyInclude = {
  activated_by: true,
  voided_by: true,
  product: {
    include: {
      template: { include: { category_ref: true } },
      ownerships: {
        include: { customer: true },
        orderBy: { created_at: 'desc' as const },
      },
    },
  },
};

const warrantyLookupInclude = {
  warranty: {
    include: {
      activation_request: true,
    },
  },
  template: {
    include: {
      category_ref: true,
    },
  },
} satisfies Prisma.ProductInclude;

const warrantySortMap: Readonly<
  Record<string, keyof Prisma.WarrantyOrderByWithRelationInput>
> = {
  createdAt: 'created_at',
  endDate: 'end_date',
  startDate: 'start_date',
  updatedAt: 'updated_at',
};

function buildWarrantyOrderBy(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
): Prisma.WarrantyOrderByWithRelationInput[] {
  const mappedSortBy = sortBy ? warrantySortMap[sortBy] : undefined;

  if (!mappedSortBy) {
    return [{ created_at: 'desc' }, { id: 'desc' }];
  }

  const orderBy = [
    { [mappedSortBy]: sortOrder },
  ] as Prisma.WarrantyOrderByWithRelationInput[];

  if (mappedSortBy !== 'created_at') {
    orderBy.push({ created_at: 'desc' });
  }

  orderBy.push({ id: 'desc' });
  return orderBy;
}

@Injectable()
export class WarrantiesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  list(filters: {
    search?: string;
    status?: warranty_status;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.WarrantyWhereInput = {
      status: filters.status,
      product: {
        deleted_at: null,
      },
      OR: search
        ? [
            { warranty_code: { contains: search, mode: 'insensitive' } },
            {
              product: {
                template: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            },
            {
              product: {
                product_code: { contains: search, mode: 'insensitive' },
              },
            },
            {
              product: {
                serial_number: { contains: search, mode: 'insensitive' },
              },
            },
            {
              product: {
                ownerships: {
                  some: {
                    is_current_owner: true,
                    customer: {
                      OR: [
                        {
                          full_name: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                        {
                          customer_code: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ]
        : undefined,
    };
    const orderBy = buildWarrantyOrderBy(filters.sortBy, filters.sortOrder);

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.warranty.findMany({
          where,
          include: warrantyInclude,
          orderBy,
          skip,
          take,
        }),
        tx.warranty.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listForExport(filters: {
    search?: string;
    status?: warranty_status;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const where: Prisma.WarrantyWhereInput = {
      status: filters.status,
      product: {
        deleted_at: null,
      },
      OR: search
        ? [
            { warranty_code: { contains: search, mode: 'insensitive' } },
            {
              product: {
                template: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            },
            {
              product: {
                product_code: { contains: search, mode: 'insensitive' },
              },
            },
            {
              product: {
                serial_number: { contains: search, mode: 'insensitive' },
              },
            },
            {
              product: {
                ownerships: {
                  some: {
                    is_current_owner: true,
                    customer: {
                      OR: [
                        {
                          full_name: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                        {
                          customer_code: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ]
        : undefined,
    };
    const orderBy = buildWarrantyOrderBy(filters.sortBy, filters.sortOrder);

    return this.prismaService.warranty.findMany({
      where,
      include: warrantyInclude,
      orderBy,
      take: 5000,
    });
  }

  findByProductId(productId: string) {
    return this.prismaService.warranty.findUnique({
      where: { product_id: productId },
    });
  }

  findById(id: string) {
    return this.prismaService.warranty.findFirst({
      where: {
        id,
        product: {
          deleted_at: null,
        },
      },
      include: warrantyInclude,
    });
  }

  update(id: string, data: Prisma.WarrantyUpdateInput) {
    return this.prismaService.warranty.update({
      where: { id },
      data,
      include: warrantyInclude,
    });
  }

  findActiveProductByWarrantyCode(code: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty: { warranty_code: code },
        deleted_at: null,
      },
      include: warrantyLookupInclude,
    });
  }

  findLookupMatchForCustomer(code: string, ownerUserId: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty: { warranty_code: code },
        deleted_at: null,
        ownerships: {
          some: {
            owner_user_id: ownerUserId,
            is_current_owner: true,
          },
        },
      },
      include: warrantyLookupInclude,
    });
  }

  listCurrentProductsForUser(ownerUserId: string) {
    return this.prismaService.product.findMany({
      where: {
        deleted_at: null,
        ownerships: {
          some: {
            owner_user_id: ownerUserId,
            is_current_owner: true,
          },
        },
      },
      include: {
        ...warrantyLookupInclude,
        ownerships: {
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  findCurrentProductForUser(productId: string, ownerUserId: string) {
    return this.prismaService.product.findFirst({
      where: {
        id: productId,
        deleted_at: null,
        ownerships: {
          some: {
            owner_user_id: ownerUserId,
            is_current_owner: true,
          },
        },
      },
      include: warrantyLookupInclude,
    });
  }
}
