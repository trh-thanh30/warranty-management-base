import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LookupWarrantyClaimsByWarrantyCodeUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(warrantyCode: string) {
    const code = warrantyCode.trim().toUpperCase();
    const claims = await this.warrantyClaimsRepository.findByWarrantyCode(code);
    return claims.map((claim) => toWarrantyClaimResponse(claim));
  }
}
