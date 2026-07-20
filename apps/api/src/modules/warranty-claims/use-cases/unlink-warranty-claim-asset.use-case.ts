import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import {
  WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
  WarrantyClaimsRepository,
} from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnlinkWarrantyClaimAssetUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(id: string, assetId: string) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const link = await this.warrantyClaimsRepository.findClaimAssetLink(
      id,
      assetId,
    );

    if (!link) {
      throw new NotFoundError('Warranty claim asset not found');
    }

    if (this.assetsService) {
      await this.assetsService.removeEntityAsset(assetId, {
        id,
        type: WARRANTY_CLAIM_ASSET_ENTITY_TYPE,
      });
    } else {
      await this.warrantyClaimsRepository.unlinkAssetFromClaim(id, assetId);
    }

    return { success: true };
  }
}
