import { BadRequestError, NotFoundError } from '@/common/response';
import { AssignWarrantyClaimServiceCenterDto } from '@/modules/warranty-claims/dto/assign-warranty-claim-service-center.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { WarrantyClaimNotificationService } from '@/modules/warranty-claims/service/warranty-claim-notification.service';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import type { AssignWarrantyClaimServiceCenterContext } from '@/modules/warranty-claims/types/warranty-claim-context.types';
import { Injectable } from '@nestjs/common';
import { warranty_claim_status } from '@prisma/client';

const TERMINAL_CLAIM_STATUSES = new Set<warranty_claim_status>([
  warranty_claim_status.COMPLETED,
  warranty_claim_status.REJECTED,
  warranty_claim_status.CANCELLED,
]);

@Injectable()
export class AssignWarrantyClaimServiceCenterUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
    private readonly warrantyClaimNotificationService?: WarrantyClaimNotificationService,
  ) {}

  async execute(
    id: string,
    dto: AssignWarrantyClaimServiceCenterDto,
    context: AssignWarrantyClaimServiceCenterContext = {},
  ) {
    const existingClaim = await this.warrantyClaimsRepository.findById(id);

    if (!existingClaim) {
      throw new NotFoundError('Warranty claim not found');
    }

    if (TERMINAL_CLAIM_STATUSES.has(existingClaim.status)) {
      throw new BadRequestError(
        'A service center cannot be changed for a terminal warranty claim',
      );
    }

    if (existingClaim.service_center_id === dto.serviceCenterId) {
      throw new BadRequestError(
        'Warranty claim is already assigned to this service center',
      );
    }

    const note = dto.note?.trim();

    if (existingClaim.service_center_id && !note) {
      throw new BadRequestError(
        'A reason is required when changing the service center',
      );
    }

    const serviceCenter =
      await this.warrantyClaimsRepository.findActiveServiceCenterById(
        dto.serviceCenterId,
      );

    if (!serviceCenter) {
      throw new NotFoundError('Active service center not found');
    }

    const claim = await this.warrantyClaimsRepository.assignServiceCenter({
      id,
      fromServiceCenterId: existingClaim.service_center_id,
      serviceCenterId: dto.serviceCenterId,
      note,
      changedByUserId: context.changedByUserId,
    });

    await this.warrantyClaimNotificationService?.serviceCenterAssigned(claim);

    return toWarrantyClaimResponse(claim);
  }
}
