import { AssetsService } from '@/modules/assets/assets.service';
import { ListActivationProductOptionsDto } from '@/modules/products/dto/list-activation-product-options.dto';
import { getActivationProductEligibility } from '@/modules/products/product-activation-eligibility';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListActivationProductOptionsUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(dto: ListActivationProductOptionsDto) {
    const result = await this.productsRepository.listActivationOptions(dto);

    return {
      items: result.items.map((product) => ({
        ...toProductResponse(
          product,
          (asset) =>
            this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
        ),
        activationEligibility: getActivationProductEligibility(product),
        activationCodeCounts: product.activationCodeCounts,
      })),
      meta: result.meta,
    };
  }
}
