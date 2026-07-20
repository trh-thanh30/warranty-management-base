import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { ProductAssetsRepository } from '@/modules/products/repository/product-assets.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RemoveProductAssetUseCase {
  constructor(
    private readonly repository: ProductAssetsRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(productId: string, productAssetId: string) {
    const existing = await this.repository.findById(productAssetId);
    if (!existing || existing.product_id !== productId) {
      throw new NotFoundError('Product image not found');
    }

    await this.repository.delete(productAssetId);
    await this.assetsService.deleteAssetIfUnreferenced(existing.asset_id);

    return { success: true };
  }
}
