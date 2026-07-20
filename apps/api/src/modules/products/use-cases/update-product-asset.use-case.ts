import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateProductAssetDto } from '@/modules/products/dto/update-product-asset.dto';
import { ProductAssetsRepository } from '@/modules/products/repository/product-assets.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateProductAssetUseCase {
  constructor(
    private readonly repository: ProductAssetsRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(
    productId: string,
    productAssetId: string,
    dto: UpdateProductAssetDto,
  ) {
    const existing = await this.repository.findById(productAssetId);
    if (!existing || existing.product_id !== productId) {
      throw new NotFoundError('Product image not found');
    }

    const { productAsset, replacedCoverAssetIds } =
      await this.repository.update(
        productAssetId,
        productId,
        {
          role: dto.role,
          sort_order: dto.sortOrder,
          alt_text:
            dto.altText === null ? null : (dto.altText?.trim() ?? undefined),
        },
        dto.role,
      );

    await Promise.all(
      replacedCoverAssetIds.map((assetId) =>
        this.assetsService.deleteAssetIfUnreferenced(assetId),
      ),
    );

    return productAsset;
  }
}
