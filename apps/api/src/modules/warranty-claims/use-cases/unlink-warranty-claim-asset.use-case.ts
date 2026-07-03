import { NotFoundError } from '@/common/response';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnlinkWarrantyClaimAssetUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(id: string, assetId: string) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const result = await this.warrantyClaimsRepository.unlinkAssetFromClaim(
      id,
      assetId,
    );

    if (result.count === 0) {
      throw new NotFoundError('Warranty claim asset not found');
    }

    return { success: true };
  }
}
