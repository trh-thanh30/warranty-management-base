import type {
  WarrantyActivationRequestExcelRow,
  WarrantyActivationRequestExportRecord,
} from '@/modules/warranty-activation-requests/excel/warranty-activation-request-excel.types';
import type { warranty_activation_request_status } from '@prisma/client';

const statusLabels: Record<warranty_activation_request_status, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  ACTIVATED: 'Đã kích hoạt',
  CANCELLED: 'Đã hủy',
};

export function toWarrantyActivationRequestExcelRow(
  request: WarrantyActivationRequestExportRecord,
): WarrantyActivationRequestExcelRow {
  const items = request.items ?? [];

  return {
    requestCode: request.request_code,
    status: statusLabels[request.status],
    warrantyCode: request.warranty_code,
    itemCount: items.length || (request.product_id ? 1 : 0),
    productsByPosition: items
      .map(
        (item) =>
          `${item.position_label}: ${item.warranty_code ?? 'Chờ phát hành'}`,
      )
      .join('; '),
    customerName: request.customer_name,
    customerPhone: request.customer_phone,
    customerEmail: request.customer_email,
    customerBirthdate: request.customer_birthdate,
    fullAddress: request.full_address,
    productName: request.product_name,
    brand: request.brand,
    model: request.model,
    installedAt: request.installed_at,
    customerNote: request.note,
    adminNote: request.admin_note,
    rejectionReason: request.rejection_reason,
    reviewedBy: request.reviewed_by
      ? (request.reviewed_by.full_name ?? request.reviewed_by.username)
      : null,
    reviewedAt: request.reviewed_at,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
}
