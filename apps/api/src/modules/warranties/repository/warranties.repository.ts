import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WarrantiesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findByProductId(productId: string) {
    return this.prismaService.warranty.findUnique({
      where: { product_id: productId },
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
