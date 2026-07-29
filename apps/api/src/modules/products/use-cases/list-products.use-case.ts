import { AssetsService } from '@/modules/assets/assets.service';
import { ListProductsDto } from '@/modules/products/dto/list-products.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListProductsUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: ListProductsDto) {
    const result = await this.productsRepository.list(dto);

    return {
      items: result.items.map((product) =>
        toProductResponse(
          product,
          (asset) =>
            this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
        ),
      ),
      meta: result.meta,
    };
  }
}
