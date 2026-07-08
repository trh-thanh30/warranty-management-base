import { NotFoundError } from '@/common/response';
import { LinkWarrantyClaimAssetDto } from '@/modules/warranty-claims/dto/link-warranty-claim-asset.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimAttachmentResponse } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';

type LinkWarrantyClaimAssetContext = {
  linkedByUserId?: string;
};

@Injectable()
export class LinkWarrantyClaimAssetUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(
    id: string,
    dto: LinkWarrantyClaimAssetDto,
    context: LinkWarrantyClaimAssetContext = {},
  ) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const asset = await this.warrantyClaimsRepository.findAssetById(
      dto.assetId,
    );

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    const link = await this.warrantyClaimsRepository.linkAssetToClaim({
      claimId: id,
      assetId: dto.assetId,
      note: dto.note?.trim(),
      linkedByUserId: context.linkedByUserId,
    });

    return toWarrantyClaimAttachmentResponse(link.asset);
  }
}
