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
  return {
    requestCode: request.request_code,
    status: statusLabels[request.status],
    warrantyCode: request.warranty_code,
    customerName: request.customer_name,
    customerPhone: request.customer_phone,
    customerEmail: request.customer_email,
    customerBirthdate: request.customer_birthdate,
    fullAddress: request.full_address,
    productName: request.product_name,
    serialNumber: request.serial_number,
    brand: request.brand,
    model: request.model,
    manufactureYear: request.manufacture_year,
    customerNote: request.note,
    adminNote: request.admin_note,
    rejectionReason: request.rejection_reason,
    reviewedBy: request.reviewed_by
      ? (request.reviewed_by.full_name ?? request.reviewed_by.username)
      : null,
    reviewedAt: request.reviewed_at,
    activatedWarrantyId: request.activated_warranty_id,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
}
