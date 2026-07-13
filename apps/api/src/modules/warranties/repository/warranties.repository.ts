import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_status } from '@prisma/client';

const warrantyInclude = {
  product: {
    include: {
      ownerships: {
        include: { customer: true },
        orderBy: { created_at: 'desc' as const },
      },
    },
  },
};

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
    const sortMap = {
      createdAt: 'created_at',
      endDate: 'end_date',
      startDate: 'start_date',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.WarrantyOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
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
                name: { contains: search, mode: 'insensitive' },
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
    const orderBy: Prisma.WarrantyOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

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

  findByProductId(productId: string) {
    return this.prismaService.warranty.findUnique({
      where: { product_id: productId },
    });
  }

  findActiveProductByWarrantyCode(code: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty_code: code,
        deleted_at: null,
      },
      include: {
        warranty: true,
      },
    });
  }

  findLookupMatchForCustomer(code: string, ownerUserId: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty_code: code,
        deleted_at: null,
        ownerships: {
          some: {
            owner_user_id: ownerUserId,
            is_current_owner: true,
          },
        },
      },
      include: {
        warranty: true,
      },
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
        ownerships: {
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
        warranty: true,
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
      include: {
        warranty: true,
      },
    });
  }
}
