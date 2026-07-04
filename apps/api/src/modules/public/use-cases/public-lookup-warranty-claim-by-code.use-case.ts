import { NotFoundError } from '@/common/response';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicLookupWarrantyClaimByCodeUseCase {
  constructor(
    private readonly warrantyClaimsRepository: WarrantyClaimsRepository,
  ) {}

  async execute(claimCode: string) {
    const claim = await this.warrantyClaimsRepository.findByClaimCode(
      claimCode.trim().toUpperCase(),
    );

    if (!claim) {
      throw new NotFoundError('Warranty claim not found');
    }

    return toPublicWarrantyClaimResponse(claim);
  }
}

export function toPublicWarrantyClaimResponse(claim: {
  claim_code: string;
  warranty_code: string;
  issue_title: string;
  status: string;
  priority?: string | null;
  due_at?: Date | null;
  submitted_at: Date;
  resolved_at?: Date | null;
  product?: {
    name: string;
    brand: string | null;
    model: string | null;
  } | null;
  service_center?: {
    name: string;
    phone: string | null;
    email: string | null;
    province: string;
    district: string | null;
    address: string;
  } | null;
}) {
  return {
    claimCode: claim.claim_code,
    warrantyCode: claim.warranty_code,
    issueTitle: claim.issue_title,
    status: claim.status,
    priority: claim.priority,
    dueAt: claim.due_at,
    submittedAt: claim.submitted_at,
    resolvedAt: claim.resolved_at,
    product: claim.product
      ? {
          name: claim.product.name,
          brand: claim.product.brand,
          model: claim.product.model,
        }
      : null,
    serviceCenter: claim.service_center
      ? {
          name: claim.service_center.name,
          phone: claim.service_center.phone,
          email: claim.service_center.email,
          province: claim.service_center.province,
          district: claim.service_center.district,
          address: claim.service_center.address,
        }
      : null,
  };
}
