import { NotFoundError } from '@/common/response';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProductDetailUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    return toProductResponse(product);
  }
}
