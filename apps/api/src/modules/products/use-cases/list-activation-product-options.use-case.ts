import { AssetsService } from '@/modules/assets/assets.service';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
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
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(dto: ListActivationProductOptionsDto) {
    const result = await this.productsRepository.listActivationOptions(dto);

    return {
      items: result.items.map((product) => ({
        ...toProductResponse(
          product,
          (asset) =>
            this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
          this.activationCodeCryptoService
            ? (ciphertext) =>
                this.activationCodeCryptoService!.decrypt(ciphertext)
            : undefined,
        ),
        activationEligibility: getActivationProductEligibility(product),
        activationCodeCounts: product.activationCodeCounts,
      })),
      meta: result.meta,
    };
  }
}
