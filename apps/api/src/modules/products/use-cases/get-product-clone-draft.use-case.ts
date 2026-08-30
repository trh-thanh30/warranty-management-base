import { BadRequestError, NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { GetProductDetailUseCase } from '@/modules/products/use-cases/get-product-detail.use-case';
import { Injectable } from '@nestjs/common';
import { product_status } from '@prisma/client';

/** Returns only content fields suitable for pre-filling a new product form. */
@Injectable()
export class GetProductCloneDraftUseCase {
  constructor(
    private readonly getProductDetailUseCase: GetProductDetailUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string) {
    const product = await this.getProductDetailUseCase.execute(id);
    if (product.status === product_status.DELETED || product.deletedAt) {
      throw new NotFoundError('Product not found');
    }
    if (product.categoryRef && !product.categoryRef.isActive) {
      throw new BadRequestError('Product category is inactive');
    }
    await this.prisma.activityLog.create({
      data: {
        action: 'PRODUCT_CLONE_DRAFT_REQUESTED',
        type: 'PRODUCT',
        admin_name: 'product-clone-api',
      },
    });
    return {
      ...product,
      productCode: null,
      serialNumber: null,
      warrantyCode: null,
      owner: null,
      warranty: product.warranty
        ? { ...product.warranty, warrantyCode: null, status: 'DRAFT' }
        : null,
    };
  }
}
