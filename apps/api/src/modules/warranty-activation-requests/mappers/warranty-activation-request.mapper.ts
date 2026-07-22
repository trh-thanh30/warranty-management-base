import type {
  Prisma,
  WarrantyActivationRequest,
  warranty_status,
} from '@prisma/client';
import type { WarrantyActivationRequestSummary } from '@repo/shared';

export type WarrantyActivationRequestWithRelations =
  WarrantyActivationRequest & {
    reviewed_by?: {
      id: string;
      email: string;
      full_name: string | null;
      username: string;
    } | null;
    activated_warranty?: {
      id: string;
      warranty_code: string | null;
      status: warranty_status;
      start_date: Date | null;
      end_date: Date | null;
      duration_months: number;
    } | null;
  };

function toMetadata(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return null;
  }

  return value;
}

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
    reviewedBy: request.reviewed_by
      ? {
          id: request.reviewed_by.id,
          displayName:
            request.reviewed_by.full_name ?? request.reviewed_by.username,
          email: request.reviewed_by.email,
          username: request.reviewed_by.username,
        }
      : null,
    reviewedAt: request.reviewed_at?.toISOString() ?? null,
    activatedWarrantyId: request.activated_warranty_id,
    activatedWarranty: request.activated_warranty
      ? {
          id: request.activated_warranty.id,
          warrantyCode:
            request.activated_warranty.warranty_code ?? request.warranty_code,
          status: request.activated_warranty.status,
          startDate:
            request.activated_warranty.start_date?.toISOString() ?? null,
          endDate: request.activated_warranty.end_date?.toISOString() ?? null,
          durationMonths: request.activated_warranty.duration_months,
        }
      : null,
    metadata: toMetadata(request.metadata),
    createdAt: request.created_at.toISOString(),
    updatedAt: request.updated_at.toISOString(),
  };
}
