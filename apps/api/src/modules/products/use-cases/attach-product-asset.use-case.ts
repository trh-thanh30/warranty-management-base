import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { AttachProductAssetDto } from '@/modules/products/dto/attach-product-asset.dto';
import { ProductAssetsRepository } from '@/modules/products/repository/product-assets.repository';
import { Injectable } from '@nestjs/common';
import { asset_type } from '@prisma/client';

@Injectable()
export class AttachProductAssetUseCase {
  constructor(
    private readonly repository: ProductAssetsRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(productId: string, dto: AttachProductAssetDto) {
    const [product, asset] = await Promise.all([
      this.repository.findProduct(productId),
      this.repository.findAsset(dto.assetId),
    ]);

    if (!product || product.deleted_at) {
      throw new NotFoundError('Product not found');
    }

    if (!asset || asset.is_deleted || asset.type !== asset_type.IMAGE) {
      throw new NotFoundError('Product image asset not found');
    }
    const { productAsset, replacedCoverAssetIds } =
      await this.repository.attach(productId, {
        assetId: dto.assetId,
        role: dto.role,
        sortOrder: dto.sortOrder ?? 0,
        altText: dto.altText?.trim(),
      });

    await Promise.all(
      replacedCoverAssetIds.map((assetId) =>
        this.assetsService.deleteAssetIfUnreferenced(assetId),
      ),
    );

    return {
      id: productAsset.id,
      assetId: asset.id,
      role: productAsset.role,
      sortOrder: productAsset.sort_order,
      altText: productAsset.alt_text,
      url: this.assetsService.enrichAssetUrl(asset).url,
      mimeType: asset.mime_type,
      originalName: asset.original_name,
    };
  }
}
