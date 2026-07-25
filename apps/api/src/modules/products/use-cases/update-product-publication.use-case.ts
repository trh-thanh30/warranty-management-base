import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateProductPublicationDto } from '@/modules/products/dto/update-product-publication.dto';
import { toProductResponse } from '@/modules/products/products.types';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateProductPublicationUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(id: string, dto: UpdateProductPublicationDto) {
    const existingProduct = await this.productsRepository.findById(id);

    if (!existingProduct || existingProduct.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    const product = await this.productsRepository.update(id, {
      is_published: dto.isPublished,
      published_at: dto.isPublished ? new Date() : null,
    });

    return toProductResponse(
      product,
      (asset) => this.assetsService?.enrichAssetUrl(asset).url ?? asset.path,
    );
  }
}
