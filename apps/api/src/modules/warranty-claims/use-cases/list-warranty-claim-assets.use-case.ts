import { NotFoundError } from '@/common/response';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimAttachmentResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListWarrantyClaimAssetsUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(id: string) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const links = await this.warrantyClaimsRepository.listClaimAssets(id);
    return links.map((link) => toWarrantyClaimAttachmentResponse(link.asset));
  }
}
