import { NotFoundError } from '@/common/response';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import {
  toWarrantyClaimAttachmentResponse,
  toWarrantyClaimResponse,
} from '@/modules/warranty-claims/mappers/warranty-claim.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetWarrantyClaimDetailUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(id: string) {
    const claim = await this.warrantyClaimsRepository.findById(id);

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    const attachments = await this.warrantyClaimsRepository.listClaimAssets(id);

    return toWarrantyClaimResponse(
      claim,
      attachments.map((link) => toWarrantyClaimAttachmentResponse(link.asset)),
    );
  }
}
