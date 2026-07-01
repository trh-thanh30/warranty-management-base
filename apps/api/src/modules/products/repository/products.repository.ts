import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, product_status, warranty_status } from '@prisma/client';

const productInclude = {
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
    status?: product_status;
    warrantyStatus?: warranty_status;
  }) {
    const search = filters.search?.trim();

    return this.prismaService.product.findMany({
      where: {
        deleted_at: null,
        category: filters.category as never,
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
      },
      include: productInclude,
      orderBy: { created_at: 'desc' },
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
