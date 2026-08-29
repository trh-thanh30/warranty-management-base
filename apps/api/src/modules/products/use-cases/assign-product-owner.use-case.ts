import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { AssignProductOwnerDto } from '@/modules/products/dto/assign-product-owner.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignProductOwnerUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsRepository: ProductsRepository,
    private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(productId: string, dto: AssignProductOwnerDto) {
    const [product, customer] = await Promise.all([
      this.prismaService.product.findUnique({
        where: { id: productId },
        include: { warranty: true },
      }),
      this.prismaService.customer.findUnique({ where: { id: dto.customerId } }),
    ]);

    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    if (!product.warranty) {
      throw new NotFoundError('Warranty not found');
    }

    const warranty = product.warranty;
    const warrantyCode = await this.resolveWarrantyCode(
      {
        id: product.id,
        warrantyCode: product.warranty.warranty_code,
      },
      dto,
    );
    const shouldSynchronizeWarrantyCode =
      warranty.warranty_code !== warrantyCode;

    const productWithOwner = await this.prismaService.$transaction(
      async (tx) => {
        if (shouldSynchronizeWarrantyCode) {
          await tx.warranty.update({
            where: { id: warranty.id },
            data: { warranty_code: warrantyCode },
          });
        }

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
            activated_at: null,
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
            category_ref: true,
            template: true,
          },
        });
      },
    );

    return toProductResponse(
      productWithOwner,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }

  private async resolveWarrantyCode(
    product: { id: string; warrantyCode: string | null },
    dto: AssignProductOwnerDto,
  ) {
    if (product.warrantyCode) return product.warrantyCode;

    if (dto.autoGenerateWarrantyCode !== false) {
      return this.generateWarrantyCodeUseCase.execute();
    }

    const warrantyCode = dto.warrantyCode?.trim().toUpperCase();
    if (!warrantyCode) {
      throw new BadRequestError('Warranty code is required');
    }
    if (!/^[A-Z0-9-]{6,64}$/.test(warrantyCode)) {
      throw new BadRequestError(
        'Warranty code must be 6-64 uppercase letters, numbers, or dashes',
      );
    }

    const existing =
      await this.productsRepository.findByWarrantyCode(warrantyCode);
    if (existing && existing.id !== product.id) {
      throw new ConflictError('Warranty code already exists');
    }

    return warrantyCode;
  }
}
