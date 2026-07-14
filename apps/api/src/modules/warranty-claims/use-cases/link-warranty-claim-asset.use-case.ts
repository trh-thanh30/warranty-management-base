import { NotFoundError } from '@/common/response';
import { LinkWarrantyClaimAssetDto } from '@/modules/warranty-claims/dto/link-warranty-claim-asset.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimAttachmentResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import type { LinkWarrantyClaimAssetContext } from '@/modules/warranty-claims/types/warranty-claim-context.types';
import { Injectable } from '@nestjs/common';

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
