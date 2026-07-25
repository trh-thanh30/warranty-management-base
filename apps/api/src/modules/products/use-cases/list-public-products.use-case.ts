import { AssetsService } from '@/modules/assets/assets.service';
import { ListPublicProductsDto } from '@/modules/products/dto/list-public-products.dto';
import { toPublicProductSummary } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListPublicProductsUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: ListPublicProductsDto) {
    const result = await this.productsRepository.listPublic(dto);

    return {
      items: result.items.map((product) =>
        toPublicProductSummary(
          product,
          (asset) =>
            this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
        ),
      ),
      meta: result.meta,
    };
  }
}
