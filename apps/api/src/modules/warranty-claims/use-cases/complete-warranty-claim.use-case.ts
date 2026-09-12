import { BadRequestError, NotFoundError } from '@/common/response';
import { CompleteWarrantyClaimDto } from '@/modules/warranty-claims/dto/complete-warranty-claim.dto';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { WarrantyClaimNotificationService } from '@/modules/warranty-claims/service/warranty-claim-notification.service';
import { WarrantyClaimSlaService } from '@/modules/warranty-claims/service/warranty-claim-sla.service';
import type { UpdateWarrantyClaimStatusContext } from '@/modules/warranty-claims/types/warranty-claim-context.types';
import { Injectable } from '@nestjs/common';
import { warranty_claim_status } from '@prisma/client';

const COMPLETABLE_STATUSES = new Set<warranty_claim_status>([
  warranty_claim_status.SUBMITTED,
  warranty_claim_status.REVIEWING,
  warranty_claim_status.APPROVED,
  warranty_claim_status.IN_REPAIR,
]);

@Injectable()
export class CompleteWarrantyClaimUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly warrantyClaimSlaService?: WarrantyClaimSlaService,
    private readonly warrantyClaimNotificationService?: WarrantyClaimNotificationService,
  ) {}

  async execute(
    id: string,
    dto: CompleteWarrantyClaimDto,
    context: UpdateWarrantyClaimStatusContext = {},
  ) {
    const existingClaim = await this.warrantyClaimsRepository.findById(id);

    if (!existingClaim) {
      throw new NotFoundError('Warranty claim not found');
    }

    if (!COMPLETABLE_STATUSES.has(existingClaim.status)) {
      throw new BadRequestError('Warranty claim cannot be completed');
    }

    const completedAt = new Date();
    const slaBreachedAt =
      this.warrantyClaimSlaService?.calculateSlaBreachedAt({
        status: warranty_claim_status.COMPLETED,
        due_at: existingClaim.due_at,
        sla_breached_at: existingClaim.sla_breached_at,
      }) ?? existingClaim.sla_breached_at;
    const claim = await this.warrantyClaimsRepository.updateStatusWithHistory({
      id,
      fromStatus: existingClaim.status,
      toStatus: warranty_claim_status.COMPLETED,
      resolvedAt: completedAt,
      slaBreachedAt,
      note: dto.note?.trim(),
      changedByUserId: context.changedByUserId,
    });

    await this.warrantyClaimNotificationService?.statusChanged(
      claim,
      existingClaim.status,
    );

    if (slaBreachedAt && !existingClaim.sla_breached_at) {
      await this.warrantyClaimNotificationService?.slaBreached(claim);
    }

    return toWarrantyClaimResponse(claim);
  }
}
