import { ListProductsDto } from '@/modules/products/dto/list-products.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(dto: ListProductsDto) {
    const products = await this.productsRepository.list(dto);
    return products.map(toProductResponse);
  }
}
