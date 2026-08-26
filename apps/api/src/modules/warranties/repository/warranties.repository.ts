import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { WarrantyTransactionRepository } from '@/modules/warranties/repository/warranty-transaction.repository';
import { toWarrantyRecord } from '@/modules/warranties/warranties.types';
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

@Injectable()
export class WarrantiesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  withTransaction<T>(
    operation: (repository: WarrantyTransactionRepository) => Promise<T>,
  ) {
    return this.prismaService.$transaction((tx) =>
      operation(new WarrantyTransactionRepository(tx)),
    );
  }

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

  listForExport(filters: {
    search?: string;
    status?: warranty_status;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
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
    const orderBy: Prisma.WarrantyOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

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

  async findRecordByProductId(productId: string) {
    const warranty = await this.prismaService.warranty.findUnique({
      where: { product_id: productId },
    });

    return warranty ? toWarrantyRecord(warranty) : null;
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
