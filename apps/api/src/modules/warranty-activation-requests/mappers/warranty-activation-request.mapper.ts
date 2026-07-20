import type { WarrantyActivationRequest } from '@prisma/client';
import type { WarrantyActivationRequestSummary } from '@repo/shared';

export type WarrantyActivationRequestWithRelations =
  WarrantyActivationRequest & {
    reviewed_by?: {
      id: string;
      email: string;
      full_name: string | null;
      username: string;
    } | null;
  };

export function toWarrantyActivationRequestResponse(
  request: WarrantyActivationRequestWithRelations,
): WarrantyActivationRequestSummary {
  return {
    id: request.id,
    requestCode: request.request_code,
    status: request.status,
    warrantyCode: request.warranty_code,
    customerName: request.customer_name,
    customerPhone: request.customer_phone,
    customerEmail: request.customer_email,
    customerBirthdate: request.customer_birthdate?.toISOString() ?? null,
    provinceCode: request.province_code,
    provinceName: request.province_name,
    wardCode: request.ward_code,
    wardName: request.ward_name,
    addressDetail: request.address_detail,
    fullAddress: request.full_address,
    productName: request.product_name,
    serialNumber: request.serial_number,
    brand: request.brand,
    model: request.model,
    manufactureYear: request.manufacture_year,
    note: request.note,
    adminNote: request.admin_note,
    rejectionReason: request.rejection_reason,
    reviewedById: request.reviewed_by_id,
    reviewedAt: request.reviewed_at?.toISOString() ?? null,
    activatedWarrantyId: request.activated_warranty_id,
    metadata: request.metadata as Record<string, unknown> | null,
    createdAt: request.created_at.toISOString(),
    updatedAt: request.updated_at.toISOString(),
  };
}
