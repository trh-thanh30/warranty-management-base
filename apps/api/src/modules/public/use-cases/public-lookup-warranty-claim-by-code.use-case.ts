import { BadRequestError, NotFoundError } from '@/common/response';
import { toPublicWarrantyClaimResponse } from '@/modules/public/mappers/public-warranty-claim.mapper';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';
import {
  isWarrantyClaimCode,
  normalizeWarrantyClaimCode,
} from '@repo/shared/utils';

@Injectable()
export class PublicLookupWarrantyClaimByCodeUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(claimCode: string) {
    if (!isWarrantyClaimCode(claimCode)) {
      throw new BadRequestError(
        'Warranty claim code is invalid',
        'WARRANTY_CLAIM_CODE_INVALID',
      );
    }

    const claim = await this.warrantyClaimsRepository.findByClaimCode(
      normalizeWarrantyClaimCode(claimCode),
    );

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    return toPublicWarrantyClaimResponse(claim);
  }
}
