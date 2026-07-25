import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { Injectable } from '@nestjs/common';
import {
  asset_access_type,
  Prisma,
  product_status,
  warranty_status,
} from '@prisma/client';

const productInclude = {
  assets: {
    include: { asset: true },
    orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
  },
  category_ref: true,
  ownerships: {
    include: { customer: true },
    orderBy: { created_at: 'desc' as const },
  },
  warranty: true,
};

const productListInclude = {
  ...productInclude,
  assets: {
    where: { role: 'COVER' as const },
    include: { asset: true },
    orderBy: { sort_order: 'asc' as const },
  },
};

const publicProductListInclude = {
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
  category_ref: true,
  warranty: true,
};

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.ProductCreateInput) {
    return this.prismaService.product.create({
      data,
      include: productInclude,
    });
  }

  findById(id: string) {
    return this.prismaService.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  findByWarrantyCode(warrantyCode: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prismaService;

    return client.product.findUnique({
      where: { warranty_code: warrantyCode },
    });
  }

  findActivationRequestTargetByWarrantyCode(warrantyCode: string) {
    return this.prismaService.product.findFirst({
      where: {
        deleted_at: null,
        warranty_code: warrantyCode,
      },
      include: {
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
        warranty: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  synchronizeWarrantyCode(input: {
    productId: string;
    warrantyCode: string;
    warrantyId: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: input.productId },
        data: { warranty_code: input.warrantyCode },
      });
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
    });
  }

  findBySlug(slug: string) {
    return this.prismaService.product.findUnique({
      where: { slug },
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
      warrantyCode: 'warranty_code',
      serialNumber: 'serial_number',
      name: 'name',
      category: 'category',
      status: 'status',
      publishedAt: 'published_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      category: filters.category as never,
      category_id: filters.categoryId,
      ownerships: filters.ownerCustomerId
        ? {
            some: {
              customer_id: filters.ownerCustomerId,
              is_current_owner: true,
            },
          }
        : undefined,
      status: filters.status,
      is_published:
        filters.isPublished === undefined
          ? undefined
          : filters.isPublished === 'true',
      warranty: filters.warrantyStatus
        ? { status: filters.warrantyStatus }
        : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { warranty_code: { contains: search, mode: 'insensitive' } },
            { serial_number: { contains: search, mode: 'insensitive' } },
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
    const search = filters.search?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      name: 'name',
      publishedAt: 'published_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : 'published_at';
    const where: Prisma.ProductWhereInput = {
      category_id: filters.categoryId,
      category_ref: { is_active: true },
      deleted_at: null,
      is_published: true,
      status: product_status.ACTIVE,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
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
    status?: product_status;
    isPublished?: string;
    warrantyStatus?: warranty_status;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const search = filters.search?.trim();
    const sortMap = {
      productCode: 'product_code',
      warrantyCode: 'warranty_code',
      serialNumber: 'serial_number',
      name: 'name',
      category: 'category',
      status: 'status',
      publishedAt: 'published_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      category: filters.category as never,
      category_id: filters.categoryId,
      ownerships: filters.ownerCustomerId
        ? {
            some: {
              customer_id: filters.ownerCustomerId,
              is_current_owner: true,
            },
          }
        : undefined,
      status: filters.status,
      is_published:
        filters.isPublished === undefined
          ? undefined
          : filters.isPublished === 'true',
      warranty: filters.warrantyStatus
        ? { status: filters.warrantyStatus }
        : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { warranty_code: { contains: search, mode: 'insensitive' } },
            { serial_number: { contains: search, mode: 'insensitive' } },
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
