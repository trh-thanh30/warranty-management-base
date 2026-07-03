import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LookupWarrantyClaimsByWarrantyCodeUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(warrantyCode: string) {
    const code = warrantyCode.trim().toUpperCase();
    const claims = await this.warrantyClaimsRepository.findByWarrantyCode(code);
    return claims.map(toWarrantyClaimResponse);
  }
}
