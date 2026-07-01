import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssignProductOwnerDto } from '@/modules/products/dto/assign-product-owner.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignProductOwnerUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(productId: string, dto: AssignProductOwnerDto) {
    const [product, customer] = await Promise.all([
      this.prismaService.product.findUnique({ where: { id: productId } }),
      this.prismaService.customer.findUnique({ where: { id: dto.customerId } }),
    ]);

    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const productWithOwner = await this.prismaService.$transaction(
      async (tx) => {
        await tx.productOwnership.updateMany({
          where: {
            product_id: productId,
            is_current_owner: true,
          },
          data: {
            is_current_owner: false,
            ended_at: new Date(),
          },
        });

        await tx.productOwnership.create({
          data: {
            product_id: productId,
            customer_id: customer.id,
            owner_user_id: customer.user_id,
            purchase_date: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
            activated_at: dto.activatedAt ? new Date(dto.activatedAt) : null,
            is_current_owner: true,
          },
        });

        return tx.product.findUniqueOrThrow({
          where: { id: productId },
          include: {
            ownerships: {
              include: { customer: true },
              orderBy: { created_at: 'desc' },
            },
            warranty: true,
          },
        });
      },
    );

    return toProductResponse(productWithOwner);
  }
}
