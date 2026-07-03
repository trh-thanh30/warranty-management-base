import { BadRequestError, NotFoundError } from '@/common/response';
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

const ALLOWED_STATUS_TRANSITIONS: Record<
  warranty_claim_status,
  warranty_claim_status[]
> = {
  [warranty_claim_status.SUBMITTED]: [
    warranty_claim_status.REVIEWING,
    warranty_claim_status.CANCELLED,
  ],
  [warranty_claim_status.REVIEWING]: [
    warranty_claim_status.APPROVED,
    warranty_claim_status.REJECTED,
    warranty_claim_status.CANCELLED,
  ],
  [warranty_claim_status.APPROVED]: [
    warranty_claim_status.IN_REPAIR,
    warranty_claim_status.CANCELLED,
  ],
  [warranty_claim_status.IN_REPAIR]: [
    warranty_claim_status.COMPLETED,
    warranty_claim_status.CANCELLED,
  ],
  [warranty_claim_status.REJECTED]: [],
  [warranty_claim_status.COMPLETED]: [],
  [warranty_claim_status.CANCELLED]: [],
};

type UpdateWarrantyClaimStatusContext = {
  changedByUserId?: string;
};

@Injectable()
export class UpdateWarrantyClaimStatusUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateWarrantyClaimStatusDto,
    context: UpdateWarrantyClaimStatusContext = {},
  ) {
    const existingClaim = await this.warrantyClaimsRepository.findById(id);

    if (!existingClaim) {
      throw new NotFoundError('Warranty claim not found');
    }

    if (existingClaim.status === dto.status) {
      throw new BadRequestError('Warranty claim already has this status');
    }

    if (
      !ALLOWED_STATUS_TRANSITIONS[existingClaim.status].includes(dto.status)
    ) {
      throw new BadRequestError('Warranty claim status transition is invalid');
    }

    const resolvedAt = TERMINAL_STATUSES.has(dto.status) ? new Date() : null;
    const claim = await this.warrantyClaimsRepository.updateStatusWithHistory({
      id,
      fromStatus: existingClaim.status,
      toStatus: dto.status,
      resolvedAt,
      note: dto.note?.trim(),
      changedByUserId: context.changedByUserId,
    });

    return toWarrantyClaimResponse(claim);
  }
}
