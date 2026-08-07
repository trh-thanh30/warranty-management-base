import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  asset_access_type,
  category_type,
  Prisma,
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

const productInclude = {
  assets: {
    include: { asset: true },
    orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
  },
  template: {
    include: {
      assets: {
        include: { asset: true },
        orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
      },
      category_ref: true,
    },
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

const publicProductTemplateListInclude = {
  category_ref: true,
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

function buildPublicProductTemplateWhere(filters: {
  categoryId?: string;
  search?: string;
  slug?: string;
}): Prisma.ProductTemplateWhereInput {
  const search = filters.search?.trim();

  return {
    ...(filters.categoryId ? { category_id: filters.categoryId } : {}),
    category_ref: { is_active: true },
    is_active: true,
    is_published: true,
    ...(filters.slug ? { slug: filters.slug } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
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
    return this.prismaService.product.create({
      data,
      include: productInclude,
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

  findActiveProductTemplateById(id: string) {
    return this.prismaService.productTemplate.findFirst({
      where: { id, is_active: true },
      include: {
        assets: {
          include: { asset: true },
          orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
        },
        category_ref: true,
      },
    });
  }

  findById(id: string) {
    return this.prismaService.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  findPublicTemplateBySlug(slug: string) {
    return this.prismaService.productTemplate.findFirst({
      where: buildPublicProductTemplateWhere({ slug }),
      include: {
        category_ref: true,
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
        warranty: true,
        template: true,
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
        warranty: true,
        template: true,
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
    templateId?: string;
    ownerCustomerId?: string;
    status?: product_status;
    isPublished?: string;
    warrantyStatus?: warranty_status;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      productCode: 'product_code',
      serialNumber: 'serial_number',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      AND: buildEffectiveCatalogueFilters(filters),
      deleted_at: buildProductDeletionFilter(filters.status),
      template_id: filters.templateId,
      ownerships: filters.ownerCustomerId
        ? {
            some: {
              customer_id: filters.ownerCustomerId,
              is_current_owner: true,
            },
          }
        : undefined,
      status: filters.status,
      template: {
        is: {
          ...(filters.isPublished === undefined
            ? {}
            : { is_published: filters.isPublished === 'true' }),
        },
      },
      warranty: filters.warrantyStatus
        ? { status: filters.warrantyStatus }
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
            {
              template: {
                is: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } },
                    { model: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
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
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

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
      name: 'name',
      publishedAt: 'published_at',
    } satisfies Record<
      'name' | 'publishedAt',
      keyof Prisma.ProductTemplateOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : 'published_at';
    const where = buildPublicProductTemplateWhere(filters);
    const orderBy: Prisma.ProductTemplateOrderByWithRelationInput[] = [
      { [sortBy]: filters.sortOrder ?? 'desc' },
    ];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.productTemplate.findMany({
          where,
          include: publicProductTemplateListInclude,
          orderBy,
          skip,
          take,
        }),
        tx.productTemplate.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listForExport(filters: {
    search?: string;
    category?: string;
    categoryId?: string;
    templateId?: string;
    ownerCustomerId?: string;
    status?: product_status;
    isPublished?: string;
    warrantyStatus?: warranty_status;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const sortMap = {
      productCode: 'product_code',
      serialNumber: 'serial_number',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      AND: buildEffectiveCatalogueFilters(filters),
      deleted_at: buildProductDeletionFilter(filters.status),
      template_id: filters.templateId,
      ownerships: filters.ownerCustomerId
        ? {
            some: {
              customer_id: filters.ownerCustomerId,
              is_current_owner: true,
            },
          }
        : undefined,
      status: filters.status,
      template: {
        is: {
          ...(filters.isPublished === undefined
            ? {}
            : { is_published: filters.isPublished === 'true' }),
        },
      },
      warranty: filters.warrantyStatus
        ? { status: filters.warrantyStatus }
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
            {
              template: {
                is: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } },
                    { model: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
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
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

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

function buildProductDeletionFilter(status?: product_status) {
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
