import { AssetsService } from '@/modules/assets/assets.service';
import { toPublicProductDetail } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetPublicProductDetailUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(slug: string) {
    const template =
      await this.productsRepository.findPublicProductBySlug(slug);

    if (!template) {
      throw new NotFoundException('Published product not found');
    }

    return toPublicProductDetail(
      template,
      (asset) => this.assetsService.enrichAssetUrl(asset).url,
    );
  }
}
