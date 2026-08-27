import { NotFoundError } from '@/common/response';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { product_status } from '@prisma/client';

@Injectable()
export class RestoreProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    if (!product.deleted_at) return toProductResponse(product);

    const restoredProduct = await this.productsRepository.update(id, {
      deleted_at: null,
      status: product_status.ACTIVE,
    });
    return toProductResponse(restoredProduct);
  }
}
