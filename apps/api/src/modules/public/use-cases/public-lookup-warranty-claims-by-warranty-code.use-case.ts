import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';
import { toPublicWarrantyClaimResponse } from '@/modules/public/mappers/public-warranty-claim.mapper';

@Injectable()
export class PublicLookupWarrantyClaimsByWarrantyCodeUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(warrantyCode: string) {
    const claims = await this.warrantyClaimsRepository.findByWarrantyCode(
      warrantyCode.trim().toUpperCase(),
    );

    return claims.map(toPublicWarrantyClaimResponse);
  }
}
