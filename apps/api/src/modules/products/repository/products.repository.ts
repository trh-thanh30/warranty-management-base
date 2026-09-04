import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { WARRANTY_CLAIM_OPEN_STATUSES } from '@repo/shared/constants';
import {
  asset_access_type,
  category_type,
  Prisma,
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

const openActivationRequestStatuses = [
  warranty_activation_request_status.PENDING,
  warranty_activation_request_status.APPROVED,
];

const productInclude = {
  assets: {
    include: { asset: true },
    orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
  },
  ownerships: {
    include: { customer: true },
    orderBy: { created_at: 'desc' as const },
  },
  warranty: true,
  warranty_activation_requests: {
    where: {
      status: {
        in: [
          warranty_activation_request_status.PENDING,
          warranty_activation_request_status.APPROVED,
        ],
      },
    },
    select: { id: true },
    take: 1,
  },
  category_ref: true,
};

const productListInclude = {
  ...productInclude,
  assets: {
    where: { role: 'COVER' as const },
    include: { asset: true },
    orderBy: { sort_order: 'asc' as const },
  },
};

const activationProductOptionInclude = {
  ...productListInclude,
  warranty_activation_requests: {
    where: { status: { in: openActivationRequestStatuses } },
    select: { id: true, request_code: true, status: true },
    orderBy: { created_at: 'desc' as const },
  },
  warranty_activation_request_items: {
    where: { status: { in: openActivationRequestStatuses } },
    select: {
      status: true,
      request: {
        select: { request_code: true, status: true },
      },
    },
    orderBy: { created_at: 'desc' as const },
  },
};

const publicProductListInclude = {
  category_ref: true,
  warranty: true,
  assets: {
    where: {
      role: 'COVER' as const,
      asset: {
        access_type: asset_access_type.PUBLIC,
        is_deleted: false,
      },
    },
    include: { asset: true },
    orderBy: { sort_order: 'asc' as const },
  },
};

function buildProductOrderBy(
  sortBy?: keyof Prisma.ProductOrderByWithRelationInput,
  sortOrder: 'asc' | 'desc' = 'desc',
): Prisma.ProductOrderByWithRelationInput[] {
  if (!sortBy) return [{ created_at: 'desc' }, { id: 'desc' }];

  const orderBy = [
    { [sortBy]: sortOrder },
  ] as Prisma.ProductOrderByWithRelationInput[];

  if (sortBy !== 'created_at') orderBy.push({ created_at: 'desc' });

  orderBy.push({ id: 'desc' });
  return orderBy;
}

function buildPublicProductWhere(filters: {
  categoryId?: string;
  search?: string;
  slug?: string;
}): Prisma.ProductWhereInput {
  const search = filters.search?.trim();

  return {
    ...(filters.categoryId ? { category_id: filters.categoryId } : {}),
    category_ref: { is_active: true },
    deleted_at: null,
    status: product_status.ACTIVE,
    is_published: true,
    ...(filters.slug ? { slug: filters.slug } : {}),
    ...(search
      ? {
          OR: [
            { display_name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.ProductCreateInput) {
    return this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.create({
        data,
        include: {
          warranties: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      });
      const currentWarranty = product.warranties[0];

      if (!currentWarranty) {
        return tx.product.findUniqueOrThrow({
          where: { id: product.id },
          include: productInclude,
        });
      }

      return tx.product.update({
        where: { id: product.id },
        data: { current_warranty_id: currentWarranty.id },
        include: productInclude,
      });
    });
  }

  findActiveProductCategoryById(id: string) {
    return this.prismaService.category.findFirst({
      where: {
        id,
        type: category_type.PRODUCT,
        is_active: true,
      },
    });
  }

  findById(id: string) {
    return this.prismaService.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  findPublicProductBySlug(slug: string) {
    return this.prismaService.product.findFirst({
      where: buildPublicProductWhere({ slug }),
      include: {
        category_ref: true,
        warranty: true,
        assets: {
          where: {
            asset: {
              access_type: asset_access_type.PUBLIC,
              is_deleted: false,
            },
          },
          include: { asset: true },
          orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
        },
      },
    });
  }

  findByWarrantyCode(warrantyCode: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prismaService;

    return client.product.findFirst({
      where: { warranty: { warranty_code: warrantyCode } },
      include: productInclude,
    });
  }

  findActivationRequestTargetByWarrantyCode(warrantyCode: string) {
    return this.prismaService.product.findFirst({
      where: {
        deleted_at: null,
        warranty: { warranty_code: warrantyCode },
      },
      include: {
        category_ref: true,
        warranty: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  findActivationRequestTargetById(productId: string) {
    return this.prismaService.product.findFirst({
      where: {
        deleted_at: null,
        id: productId,
      },
      include: {
        category_ref: true,
        warranty: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  findActivationRequestTargetsByIds(productIds: string[]) {
    return this.prismaService.product.findMany({
      where: {
        deleted_at: null,
        id: { in: productIds },
      },
      include: {
        category_ref: true,
        warranty: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  synchronizeWarrantyCode(input: { warrantyCode: string; warrantyId: string }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.warranty.update({
        where: { id: input.warrantyId },
        data: { warranty_code: input.warrantyCode },
      });
    });
  }

  findByProductCode(productCode: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prismaService;

    return client.product.findUnique({
      where: { product_code: productCode },
      include: productInclude,
    });
  }

  findBySerialNumber(serialNumber: string) {
    return this.prismaService.product.findUnique({
      where: { serial_number: serialNumber },
    });
  }

  list(filters: {
    search?: string;
    category?: string;
    categoryId?: string;
    ownerCustomerId?: string;
    status?: product_status | 'ALL';
    isPublished?: string;
    activationEligible?: string;
    claimEligible?: string;
    warrantyStatus?: warranty_status;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const claimEligible = filters.claimEligible === 'true';
    const activationEligible =
      filters.activationEligible === 'true' && !claimEligible;
    const now = new Date();
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      productCode: 'product_code',
      serialNumber: 'serial_number',
      name: 'display_name',
      publishedAt: 'published_at',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      AND: buildEffectiveCatalogueFilters(filters),
      deleted_at:
        activationEligible || claimEligible
          ? null
          : buildProductDeletionFilter(filters.status),
      ownerships: filters.ownerCustomerId
        ? {
            some: {
              customer_id: filters.ownerCustomerId,
              is_current_owner: true,
            },
          }
        : undefined,
      status: activationEligible
        ? product_status.ACTIVE
        : claimEligible
          ? product_status.ACTIVE
          : filters.status === undefined
            ? product_status.ACTIVE
            : filters.status === 'ALL'
              ? undefined
              : filters.status,
      is_published:
        filters.isPublished === undefined
          ? undefined
          : filters.isPublished === 'true',
      warranty: claimEligible
        ? {
            is: {
              status: warranty_status.ACTIVE,
              warranty_code: { not: '' },
              AND: [
                {
                  OR: [{ start_date: null }, { start_date: { lte: now } }],
                },
                {
                  OR: [{ end_date: null }, { end_date: { gte: now } }],
                },
              ],
              claims: {
                none: {
                  status: { in: [...WARRANTY_CLAIM_OPEN_STATUSES] },
                },
              },
            },
          }
        : activationEligible
          ? {
              is: {
                status: warranty_status.DRAFT,
                warranty_code: { not: '' },
              },
            }
          : filters.warrantyStatus
            ? { status: filters.warrantyStatus }
            : undefined,
      warranty_activation_request_items: activationEligible
        ? {
            none: { status: { in: openActivationRequestStatuses } },
          }
        : undefined,
      warranty_activation_requests: activationEligible
        ? {
            none: { status: { in: openActivationRequestStatuses } },
          }
        : undefined,
      OR: search
        ? [
            { product_code: { contains: search, mode: 'insensitive' } },
            {
              warranty: {
                warranty_code: { contains: search, mode: 'insensitive' },
              },
            },
            { serial_number: { contains: search, mode: 'insensitive' } },
            { display_name: { contains: search, mode: 'insensitive' } },
            { display_name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
            {
              ownerships: {
                some: {
                  is_current_owner: true,
                  customer: {
                    full_name: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            },
          ]
        : undefined,
    };
    const orderBy = buildProductOrderBy(sortBy, filters.sortOrder);

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.product.findMany({
          where,
          include: productListInclude,
          orderBy,
          skip,
          take,
        }),
        tx.product.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listActivationOptions(filters: {
    categoryId: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const baseWhere: Prisma.ProductWhereInput = {
      category_id: filters.categoryId,
      ...buildProductSearchWhere(filters.search),
    };
    const eligibilityWhere = buildActivationEligibleProductWhere();
    const eligibleWhere: Prisma.ProductWhereInput = {
      AND: [baseWhere, eligibilityWhere],
    };
    const ineligibleWhere: Prisma.ProductWhereInput = {
      AND: [baseWhere, { NOT: eligibilityWhere }],
    };
    const orderBy = buildProductOrderBy('created_at', 'desc');

    return this.prismaService.$transaction(async (tx) => {
      const [eligibleTotal, total] = await Promise.all([
        tx.product.count({ where: eligibleWhere }),
        tx.product.count({ where: baseWhere }),
      ]);
      const eligibleSkip = Math.min(skip, eligibleTotal);
      const eligibleTake = Math.min(
        take,
        Math.max(eligibleTotal - eligibleSkip, 0),
      );
      const ineligibleSkip = Math.max(skip - eligibleTotal, 0);
      const ineligibleTake = take - eligibleTake;
      const [eligibleItems, ineligibleItems] = await Promise.all([
        eligibleTake > 0
          ? tx.product.findMany({
              where: eligibleWhere,
              include: activationProductOptionInclude,
              orderBy,
              skip: eligibleSkip,
              take: eligibleTake,
            })
          : Promise.resolve([]),
        ineligibleTake > 0
          ? tx.product.findMany({
              where: ineligibleWhere,
              include: activationProductOptionInclude,
              orderBy,
              skip: ineligibleSkip,
              take: ineligibleTake,
            })
          : Promise.resolve([]),
      ]);

      const products = [...eligibleItems, ...ineligibleItems];
      const productIds = products.map((product) => product.id);
      const groupedCodes = productIds.length
        ? await tx.activationCode.groupBy({
            by: ['product_id', 'status'],
            where: { product_id: { in: productIds } },
            _count: { _all: true },
          })
        : [];
      const countsByProduct = new Map<string, Record<string, number>>();
      for (const row of groupedCodes) {
        const productId = row.product_id;
        if (!productId) continue;
        const counts = countsByProduct.get(productId) ?? {};
        counts[row.status] = (counts[row.status] ?? 0) + row._count._all;
        countsByProduct.set(productId, counts);
      }

      return paginate(
        products.map((product) => ({
          ...product,
          activationCodeCounts: countsByProduct.get(product.id) ?? {},
        })),
        {
          page,
          limit,
          total,
        },
      );
    });
  }

  listPublic(filters: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'publishedAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      name: 'display_name',
      publishedAt: 'published_at',
    } satisfies Record<
      'name' | 'publishedAt',
      keyof Prisma.ProductOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : 'published_at';
    const where = buildPublicProductWhere(filters);
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { [sortBy]: filters.sortOrder ?? 'desc' },
    ];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.product.findMany({
          where,
          include: publicProductListInclude,
          orderBy,
          skip,
          take,
        }),
        tx.product.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listForExport(filters: {
    search?: string;
    category?: string;
    categoryId?: string;
    ownerCustomerId?: string;
    status?: product_status | 'ALL';
    isPublished?: string;
    activationEligible?: string;
    warrantyStatus?: warranty_status;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const activationEligible = filters.activationEligible === 'true';
    const sortMap = {
      productCode: 'product_code',
      serialNumber: 'serial_number',
      name: 'display_name',
      publishedAt: 'published_at',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      AND: buildEffectiveCatalogueFilters(filters),
      deleted_at: activationEligible
        ? null
        : buildProductDeletionFilter(filters.status),
      ownerships: filters.ownerCustomerId
        ? {
            some: {
              customer_id: filters.ownerCustomerId,
              is_current_owner: true,
            },
          }
        : undefined,
      status: activationEligible
        ? product_status.ACTIVE
        : filters.status === undefined
          ? product_status.ACTIVE
          : filters.status === 'ALL'
            ? undefined
            : filters.status,
      is_published:
        filters.isPublished === undefined
          ? undefined
          : filters.isPublished === 'true',
      warranty: activationEligible
        ? {
            is: {
              status: warranty_status.DRAFT,
              warranty_code: { not: '' },
            },
          }
        : filters.warrantyStatus
          ? { status: filters.warrantyStatus }
          : undefined,
      warranty_activation_request_items: activationEligible
        ? {
            none: { status: { in: openActivationRequestStatuses } },
          }
        : undefined,
      warranty_activation_requests: activationEligible
        ? {
            none: { status: { in: openActivationRequestStatuses } },
          }
        : undefined,
      OR: search
        ? [
            { product_code: { contains: search, mode: 'insensitive' } },
            {
              warranty: {
                warranty_code: { contains: search, mode: 'insensitive' },
              },
            },
            { serial_number: { contains: search, mode: 'insensitive' } },
            { display_name: { contains: search, mode: 'insensitive' } },
            { display_name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
            {
              ownerships: {
                some: {
                  is_current_owner: true,
                  customer: {
                    full_name: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            },
          ]
        : undefined,
    };
    const orderBy = buildProductOrderBy(sortBy, filters.sortOrder);

    return this.prismaService.product.findMany({
      where,
      include: productInclude,
      orderBy,
      take: 5000,
    });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prismaService.product.update({
      where: { id },
      data,
      include: productInclude,
    });
  }
}

function buildProductDeletionFilter(status?: product_status | 'ALL') {
  if (status === 'ALL') return undefined;
  return status === product_status.DELETED ? { not: null } : null;
}

function buildEffectiveCatalogueFilters(filters: {
  categoryId?: string;
}): Prisma.ProductWhereInput[] | undefined {
  const clauses: Prisma.ProductWhereInput[] = [];
  if (filters.categoryId) {
    clauses.push({ category_id: filters.categoryId });
  }
  return clauses.length > 0 ? clauses : undefined;
}

function buildActivationEligibleProductWhere(): Prisma.ProductWhereInput {
  return {
    deleted_at: null,
    status: product_status.ACTIVE,
    OR: [
      {
        warranty: {
          is: {
            status: warranty_status.DRAFT,
            warranty_code: { not: '' },
          },
        },
      },
      {
        warranty: { is: null },
        warranty_duration_months: { gt: 0 },
        category_ref: { activation_code_enabled: true },
      },
    ],
    warranty_activation_request_items: {
      none: { status: { in: openActivationRequestStatuses } },
    },
    warranty_activation_requests: {
      none: { status: { in: openActivationRequestStatuses } },
    },
  };
}

function buildProductSearchWhere(search?: string): Prisma.ProductWhereInput {
  const value = search?.trim();
  if (!value) return {};

  return {
    OR: [
      { product_code: { contains: value, mode: 'insensitive' } },
      {
        warranty: {
          warranty_code: { contains: value, mode: 'insensitive' },
        },
      },
      { serial_number: { contains: value, mode: 'insensitive' } },
      { display_name: { contains: value, mode: 'insensitive' } },
      { display_name: { contains: value, mode: 'insensitive' } },
      { product_code: { contains: value, mode: 'insensitive' } },
      { brand: { contains: value, mode: 'insensitive' } },
      { model: { contains: value, mode: 'insensitive' } },
      {
        ownerships: {
          some: {
            is_current_owner: true,
            customer: {
              full_name: { contains: value, mode: 'insensitive' },
            },
          },
        },
      },
    ],
  };
}
