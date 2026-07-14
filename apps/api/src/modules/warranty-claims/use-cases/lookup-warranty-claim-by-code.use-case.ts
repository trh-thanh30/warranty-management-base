import { NotFoundError } from '@/common/response';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LookupWarrantyClaimByCodeUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(claimCode: string) {
    const code = claimCode.trim().toUpperCase();
    const claim = await this.warrantyClaimsRepository.findByClaimCode(code);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    return toWarrantyClaimResponse(claim);
  }
}
