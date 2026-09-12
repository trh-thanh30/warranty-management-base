import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { WarrantyTransactionRepository } from '@/modules/warranties/repository/warranty-transaction.repository';
import { toWarrantyRecord } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';
import { WARRANTY_CLAIM_OPEN_STATUSES } from '@repo/shared/constants';

const warrantyInclude = {
  activated_by: true,
  voided_by: true,
  dealer: true,
  activation_code: {
    select: { id: true, code_ciphertext: true, status: true },
  },
  activation_request: true,
  claims: {
    where: { status: { in: [...WARRANTY_CLAIM_OPEN_STATUSES] } },
    orderBy: { submitted_at: 'desc' as const },
    take: 1,
    select: { id: true, claim_code: true, status: true },
  },
  ownerships: {
    where: { is_current_owner: true },
    include: { customer: true },
    orderBy: { created_at: 'desc' as const },
  },
  product: {
    include: {
      category_ref: true,
    },
  },
};

const warrantyLookupInclude = {
  activation_code: { select: { code_ciphertext: true } },
  activation_request: true,
  ownerships: {
    where: { is_current_owner: true },
    include: { customer: true },
    take: 1,
  },
  product: { include: { category_ref: true } },
} satisfies Prisma.WarrantyInclude;

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

  withTransaction<T>(
    operation: (repository: WarrantyTransactionRepository) => Promise<T>,
  ) {
    return this.prismaService.$transaction((tx) =>
      operation(new WarrantyTransactionRepository(tx)),
    );
  }

  list(filters: {
    categoryId?: string;
    claimEligible?: string;
    includeOpenClaim?: string;
    dealerIds?: string[];
    productId?: string;
    search?: string;
    status?: warranty_status | 'ALL';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const claimEligible = filters.claimEligible === 'true';
    const includeOpenClaim =
      claimEligible && filters.includeOpenClaim === 'true';
    const now = new Date();
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.WarrantyWhereInput = {
      AND: claimEligible
        ? [
            { OR: [{ start_date: null }, { start_date: { lte: now } }] },
            { OR: [{ end_date: null }, { end_date: { gte: now } }] },
          ]
        : undefined,
      claims:
        claimEligible && !includeOpenClaim
          ? {
              none: {
                status: { in: [...WARRANTY_CLAIM_OPEN_STATUSES] },
              },
            }
          : undefined,
      dealer_id: filters.dealerIds ? { in: filters.dealerIds } : undefined,
      ownerships: claimEligible
        ? { some: { is_current_owner: true } }
        : undefined,
      product_id: filters.productId,
      status: claimEligible
        ? warranty_status.ACTIVE
        : filters.status === undefined
          ? warranty_status.ACTIVE
          : filters.status === 'ALL'
            ? undefined
            : filters.status,
      warranty_code: claimEligible ? { not: '' } : undefined,
      product: {
        category_id: filters.categoryId,
        deleted_at: null,
        status: claimEligible ? product_status.ACTIVE : undefined,
      },
      OR: search
        ? [
            { warranty_code: { contains: search, mode: 'insensitive' } },
            {
              product: {
                display_name: { contains: search, mode: 'insensitive' },
              },
            },
            {
              product: {
                product_code: { contains: search, mode: 'insensitive' },
              },
            },
            { serial_number: { contains: search, mode: 'insensitive' } },
            {
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
    dealerIds?: string[];
    search?: string;
    status?: warranty_status | 'ALL';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const where: Prisma.WarrantyWhereInput = {
      dealer_id: filters.dealerIds ? { in: filters.dealerIds } : undefined,
      status:
        filters.status === undefined
          ? warranty_status.ACTIVE
          : filters.status === 'ALL'
            ? undefined
            : filters.status,
      product: {
        deleted_at: null,
      },
      OR: search
        ? [
            { warranty_code: { contains: search, mode: 'insensitive' } },
            {
              product: {
                display_name: { contains: search, mode: 'insensitive' },
              },
            },
            {
              product: {
                product_code: { contains: search, mode: 'insensitive' },
              },
            },
            { serial_number: { contains: search, mode: 'insensitive' } },
            {
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
    return this.prismaService.warranty.findFirst({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findRecordByProductId(productId: string, dealerIds?: string[]) {
    const warranty = await this.prismaService.warranty.findFirst({
      where: {
        product_id: productId,
        dealer_id: dealerIds ? { in: dealerIds } : undefined,
      },
      orderBy: { created_at: 'desc' },
    });

    return warranty ? toWarrantyRecord(warranty) : null;
  }

  findById(id: string, dealerIds?: string[]) {
    return this.prismaService.warranty.findFirst({
      where: {
        id,
        dealer_id: dealerIds ? { in: dealerIds } : undefined,
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

  findByWarrantyCode(code: string) {
    return this.prismaService.warranty.findUnique({
      where: {
        warranty_code: code,
      },
      include: warrantyLookupInclude,
    });
  }

  findLookupMatchForCustomer(code: string, ownerUserId: string) {
    return this.prismaService.warranty.findFirst({
      where: {
        warranty_code: code,
        product: { deleted_at: null },
        ownerships: {
          some: { owner_user_id: ownerUserId, is_current_owner: true },
        },
      },
      include: warrantyLookupInclude,
    });
  }

  listCurrentProductsForUser(ownerUserId: string) {
    return this.prismaService.warranty.findMany({
      where: {
        product: { deleted_at: null },
        ownerships: {
          some: { owner_user_id: ownerUserId, is_current_owner: true },
        },
      },
      include: warrantyLookupInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  findCurrentProductForUser(productId: string, ownerUserId: string) {
    return this.prismaService.warranty.findFirst({
      where: {
        product_id: productId,
        product: { deleted_at: null },
        ownerships: {
          some: { owner_user_id: ownerUserId, is_current_owner: true },
        },
      },
      include: warrantyLookupInclude,
      orderBy: { created_at: 'desc' },
    });
  }
}
