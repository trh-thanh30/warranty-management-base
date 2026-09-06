import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProductDetailUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
    private readonly activationCodeCryptoService?: ActivationCodeCryptoService,
  ) {}

  async execute(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
      this.activationCodeCryptoService
        ? (ciphertext) => this.activationCodeCryptoService!.decrypt(ciphertext)
        : undefined,
    );
  }
}
