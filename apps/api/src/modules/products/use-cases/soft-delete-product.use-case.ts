import { NotFoundError } from '@/common/response';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';
import { product_status } from '@prisma/client';

@Injectable()
export class SoftDeleteProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string) {
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct || existingProduct.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    const product = await this.productsRepository.update(id, {
      status: product_status.DELETED,
      deleted_at: new Date(),
    });

    return toProductResponse(product);
  }
}
