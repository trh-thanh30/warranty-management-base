import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { toWarrantyClaimResponse } from '@/modules/warranty-claims/warranty-claims.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListWarrantyClaimsUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(filters: ListWarrantyClaimsDto) {
    const claims = await this.warrantyClaimsRepository.list(filters);
    return claims.map((claim) => toWarrantyClaimResponse(claim));
  }
}
