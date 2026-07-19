import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

const productInclude = {
  category_ref: true,
  ownerships: {
    include: { customer: true },
    orderBy: { created_at: 'desc' as const },
  },
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

  findByWarrantyCode(warrantyCode: string) {
    return this.prismaService.product.findUnique({
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

  findByProductCode(productCode: string) {
    return this.prismaService.product.findUnique({
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
      deleted_at: null,
      category: filters.category as never,
      category_id: filters.categoryId,
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
          include: productInclude,
          orderBy,
          skip,
          take,
        }),
        tx.product.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
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
