import { BadRequestError, NotFoundError } from '@/common/response';
import { AssignWarrantyClaimServiceCenterDto } from '@/modules/warranty-claims/dto/assign-warranty-claim-service-center.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';

type AssignWarrantyClaimServiceCenterContext = {
  changedByUserId?: string;
};

@Injectable()
export class AssignWarrantyClaimServiceCenterUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
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

    if (existingClaim.service_center_id === dto.serviceCenterId) {
      throw new BadRequestError(
        'Warranty claim is already assigned to this service center',
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
      serviceCenterId: dto.serviceCenterId,
      status: existingClaim.status,
      note: dto.note?.trim(),
      changedByUserId: context.changedByUserId,
    });

    return toWarrantyClaimResponse(claim);
  }
}
