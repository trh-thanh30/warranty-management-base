import type {
  WarrantyClaimExcelRow,
  WarrantyClaimExportRecord,
} from '@/modules/warranty-claims/excel/warranty-claim-excel.types';
import { warranty_claim_priority, warranty_claim_status } from '@prisma/client';
import { getProductCatalogue } from '@/modules/products/product-catalogue';

const statusLabels: Record<warranty_claim_status, string> = {
  SUBMITTED: 'Đã gửi',
  REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  IN_REPAIR: 'Đang sửa',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const priorityLabels: Record<warranty_claim_priority, string> = {
  LOW: 'Thấp',
  NORMAL: 'Bình thường',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

const terminalStatuses = new Set<warranty_claim_status>([
  warranty_claim_status.COMPLETED,
  warranty_claim_status.REJECTED,
  warranty_claim_status.CANCELLED,
]);

export function toWarrantyClaimExcelRow(
  claim: WarrantyClaimExportRecord,
  now = new Date(),
): WarrantyClaimExcelRow {
  const productName = claim.product
    ? getProductCatalogue(claim.product).name
    : null;
  return {
    claimCode: claim.claim_code,
    warrantyCode: claim.warranty_code,
    productCode: claim.product?.product_code ?? null,
    productName,
    serialNumber: claim.warranty?.serial_number ?? null,
    requesterName: claim.requester_name,
    requesterPhone: claim.requester_phone,
    customerName: claim.customer?.full_name ?? null,
    issueTitle: claim.issue_title,
    issueDetail: claim.issue_detail,
    status: statusLabels[claim.status],
    priority: priorityLabels[claim.priority],
    slaStatus: getSlaStatus(claim, now),
    dueAt: claim.due_at,
    slaBreachedAt: claim.sla_breached_at,
    serviceCenterName: claim.service_center?.name ?? null,
    serviceCenterProvince: claim.service_center?.province ?? null,
    serviceCenterPhone: claim.service_center?.phone ?? null,
    submittedAt: claim.submitted_at,
    resolvedAt: claim.resolved_at,
    createdAt: claim.created_at,
  };
}

function getSlaStatus(claim: WarrantyClaimExportRecord, now: Date) {
  if (claim.sla_breached_at) return 'Đã vi phạm SLA';
  if (!claim.due_at) return 'Chưa đặt SLA';
  if (!terminalStatuses.has(claim.status) && claim.due_at < now) {
    return 'Quá hạn';
  }

  return 'Đúng hạn';
}
