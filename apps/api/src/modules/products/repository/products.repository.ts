import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

const productInclude = {
  assets: {
    include: { asset: true },
    orderBy: [{ role: 'asc' as const }, { sort_order: 'asc' as const }],
  },
  category_ref: true,
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
};

const productListInclude = {
  ...productInclude,
  assets: {
    where: { role: 'COVER' as const },
    include: { asset: true },
    orderBy: { sort_order: 'asc' as const },
  },
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
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      AND: buildEffectiveCatalogueFilters(filters),
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
              template: {
                is: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
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

  listForExport(filters: {
    search?: string;
    category?: string;
    categoryId?: string;
    templateId?: string;
    ownerCustomerId?: string;
    status?: product_status;
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
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.ProductOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ProductWhereInput = {
      AND: buildEffectiveCatalogueFilters(filters),
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
              template: {
                is: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
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

function buildEffectiveCatalogueFilters(filters: {
  category?: string;
  categoryId?: string;
}): Prisma.ProductWhereInput[] | undefined {
  const clauses: Prisma.ProductWhereInput[] = [];
  if (filters.category) {
    clauses.push({
      OR: [
        {
          template: {
            is: { category: filters.category as never },
          },
        },
        {
          template_id: null,
          category: filters.category as never,
        },
      ],
    });
  }
  if (filters.categoryId) {
    clauses.push({
      OR: [
        {
          template: {
            is: { category_id: filters.categoryId },
          },
        },
        {
          template_id: null,
          category_id: filters.categoryId,
        },
      ],
    });
  }
  return clauses.length > 0 ? clauses : undefined;
}
