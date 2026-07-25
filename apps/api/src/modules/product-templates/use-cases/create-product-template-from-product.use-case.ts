import { ConflictError, NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { toProductTemplateResponse } from '@/modules/product-templates/product-templates.types';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateProductTemplateFromProductUseCase {
  constructor(
    private readonly productTemplatesRepository: ProductTemplatesRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(productId: string) {
    const product =
      await this.productTemplatesRepository.findProductTemplateSource(
        productId,
      );
    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }
    if (product.template_id) {
      throw new ConflictError('Product already has a template');
    }

    const template =
      await this.productTemplatesRepository.createFromProduct(productId);
    return toProductTemplateResponse(
      template,
      (asset) => this.assetsService.enrichAssetUrl(asset).url,
    );
  }
}
