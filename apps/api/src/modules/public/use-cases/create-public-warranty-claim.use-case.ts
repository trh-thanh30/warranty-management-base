import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatePublicWarrantyClaimUseCase {
  constructor(
    private readonly createWarrantyClaimUseCase: CreateWarrantyClaimUseCase,
  ) {}

  async execute(dto: CreateWarrantyClaimDto) {
    const claim = await this.createWarrantyClaimUseCase.execute(dto, {
      requireOwnerMatch: true,
    });

    return {
      claimCode: claim.claimCode,
      warrantyCode: claim.warrantyCode,
      issueTitle: claim.issueTitle,
      status: claim.status,
      priority: claim.priority,
      dueAt: claim.dueAt,
      submittedAt: claim.submittedAt,
      resolvedAt: claim.resolvedAt,
      product: claim.product
        ? {
            name: claim.product.name,
            brand: claim.product.brand,
            model: claim.product.model,
          }
        : null,
      serviceCenter: claim.serviceCenter
        ? {
            name: claim.serviceCenter.name,
            phone: claim.serviceCenter.phone,
            email: claim.serviceCenter.email,
            province: claim.serviceCenter.province,
            district: claim.serviceCenter.district,
            address: claim.serviceCenter.address,
          }
        : null,
    };
  }
}
