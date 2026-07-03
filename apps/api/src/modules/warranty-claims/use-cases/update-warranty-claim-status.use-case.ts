import { NotFoundError } from '@/common/response';
import { UpdateWarrantyClaimStatusDto } from '@/modules/warranty-claims/dto/update-warranty-claim-status.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';
import { warranty_claim_status } from '@prisma/client';

const TERMINAL_STATUSES = new Set<warranty_claim_status>([
  warranty_claim_status.COMPLETED,
  warranty_claim_status.REJECTED,
  warranty_claim_status.CANCELLED,
]);

@Injectable()
export class UpdateWarrantyClaimStatusUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(id: string, dto: UpdateWarrantyClaimStatusDto) {
    const existingClaim = await this.warrantyClaimsRepository.findById(id);

    if (!existingClaim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const resolvedAt = TERMINAL_STATUSES.has(dto.status) ? new Date() : null;
    const claim = await this.warrantyClaimsRepository.updateStatus(
      id,
      dto.status,
      resolvedAt,
    );

    return toWarrantyClaimResponse(claim);
  }
}
