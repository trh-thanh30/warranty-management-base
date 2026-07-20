import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { AssignProductOwnerDto } from '@/modules/products/dto/assign-product-owner.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignProductOwnerUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly assetsService?: AssetsService,
  ) {}

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
            owner_user_id: customer.user_id ?? null,
            purchase_date: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
            activated_at: dto.activatedAt ? new Date(dto.activatedAt) : null,
            is_current_owner: true,
          },
        });

        return tx.product.findUniqueOrThrow({
          where: { id: productId },
          include: {
            assets: {
              include: { asset: true },
              orderBy: [{ role: 'asc' }, { sort_order: 'asc' }],
            },
            ownerships: {
              include: { customer: true },
              orderBy: { created_at: 'desc' },
            },
            warranty: true,
          },
        });
      },
    );

    return toProductResponse(
      productWithOwner,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }
}
