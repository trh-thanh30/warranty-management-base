import { NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimAttachmentResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListWarrantyClaimAssetsUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly assetsService: AssetsService,
  ) {}

  async execute(id: string) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const links = await this.warrantyClaimsRepository.listClaimAssets(id);
    return links.map((link) =>
      toWarrantyClaimAttachmentResponse(
        this.assetsService.enrichAssetUrl(link.asset),
      ),
    );
  }
}
