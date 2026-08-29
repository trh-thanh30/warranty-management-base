import type { WarrantyClaimWithRelations } from '@/modules/warranty-claims/types/warranty-claim.types';
import type {
  PublicWarrantyClaimSummary,
  PublicWarrantyClaimTimelineItem,
} from '@repo/shared';
import { warranty_claim_status } from '@prisma/client';
import { getProductCatalogue } from '@/modules/products/product-catalogue';

export function toPublicWarrantyClaimResponse(
  claim: WarrantyClaimWithRelations,
): PublicWarrantyClaimSummary {
  const catalogue = claim.product ? getProductCatalogue(claim.product) : null;

  return {
    claimCode: claim.claim_code,
    warrantyCode: claim.warranty_code,
    issueTitle: claim.issue_title,
    status: claim.status,
    priority: claim.priority,
    dueAt: claim.due_at?.toISOString() ?? null,
    submittedAt: claim.submitted_at.toISOString(),
    resolvedAt: claim.resolved_at?.toISOString() ?? null,
    product:
      claim.product && catalogue
        ? {
            name: claim.product.display_name ?? catalogue.name,
            brand: catalogue.brand,
            model: catalogue.model,
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
    timeline: toPublicWarrantyClaimTimeline(claim),
  };
}

function toPublicWarrantyClaimTimeline(
  claim: WarrantyClaimWithRelations,
): PublicWarrantyClaimTimelineItem[] {
  const timeline: PublicWarrantyClaimTimelineItem[] = [
    {
      type: 'STATUS_CHANGED',
      status: warranty_claim_status.SUBMITTED,
      createdAt: claim.submitted_at.toISOString(),
    },
    ...(claim.status_history ?? []).map((event) => ({
      type: 'STATUS_CHANGED' as const,
      status: event.to_status,
      createdAt: event.created_at.toISOString(),
    })),
    ...(claim.service_center_history ?? []).map((event) => ({
      type: event.from_service_center_name
        ? ('SERVICE_CENTER_CHANGED' as const)
        : ('SERVICE_CENTER_ASSIGNED' as const),
      serviceCenterName: event.to_service_center_name,
      createdAt: event.created_at.toISOString(),
    })),
  ];

  return timeline.sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}
