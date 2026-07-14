import { NotFoundError } from '@/common/response';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimTimeline } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyClaimTimelineUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(id: string) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    return toWarrantyClaimTimeline(claim);
  }
}
