import type {
  Prisma,
  WarrantyActivationRequest,
  warranty_status,
  warranty_certificate_email_status,
  warranty_certificate_status,
} from '@prisma/client';
import type { WarrantyActivationRequestSummary } from '@repo/shared';

export type WarrantyActivationRequestWithRelations =
  WarrantyActivationRequest & {
    created_by?: {
      id: string;
      email: string;
      full_name: string | null;
      username: string;
    } | null;
    customer?: {
      id: string;
      customer_code: string;
      email: string | null;
      full_name: string;
      phone: string | null;
    } | null;
    dealer?: {
      id: string;
      name: string;
      phone: string | null;
      address: string;
      province: string;
      district: string | null;
      sales_name: string | null;
    } | null;
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
    certificate?: {
      id: string;
      certificate_number: string;
      status: warranty_certificate_status;
      storage_key: string | null;
      recipient_email: string | null;
      generated_at: Date | null;
      emailed_at: Date | null;
      email_status: warranty_certificate_email_status;
      last_error: string | null;
    } | null;
    items?: Array<{
      id: string;
      activation_field_id: string | null;
      position_key: string;
      position_label: string;
      product_id: string;
      product_name: string;
      product_code: string;
      serial_number: string | null;
      warranty_id: string;
      warranty_code: string;
      status: WarrantyActivationRequest['status'];
      activated_at: Date | null;
      warranty: {
        status: warranty_status;
      };
    }>;
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
    source: request.source,
    warrantyCode: request.warranty_code,
    categoryId: request.category_id,
    productId: request.product_id,
    dealerId: request.dealer_id,
    dealer: request.dealer
      ? {
          id: request.dealer.id,
          name: request.dealer.name,
          phone: request.dealer.phone,
          address: request.dealer.address,
          province: request.dealer.province,
          district: request.dealer.district,
          salesName: request.dealer.sales_name,
        }
      : null,
    customerName: request.customer_name,
    customerPhone: request.customer_phone,
    customerEmail: request.customer_email,
    customerBirthdate: request.customer_birthdate?.toISOString() ?? null,
    vehiclePlate: request.vehicle_plate,
    vehicleModel: request.vehicle_model,
    installedAt: request.installed_at?.toISOString() ?? null,
    warrantyDurationMonths: request.warranty_duration_months,
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
    createdById: request.created_by_id,
    createdBy: request.created_by
      ? {
          id: request.created_by.id,
          displayName:
            request.created_by.full_name ?? request.created_by.username,
          email: request.created_by.email,
          username: request.created_by.username,
        }
      : null,
    customerId: request.customer_id,
    customer: request.customer
      ? {
          id: request.customer.id,
          customerCode: request.customer.customer_code,
          fullName: request.customer.full_name,
          email: request.customer.email,
          phone: request.customer.phone,
        }
      : null,
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
    certificate: toCertificateSummary(request.id, request.certificate ?? null),
    items: request.items?.map((item) => ({
      id: item.id,
      activationFieldId: item.activation_field_id,
      positionKey: item.position_key,
      positionLabel: item.position_label,
      productId: item.product_id,
      productName: item.product_name,
      productCode: item.product_code,
      serialNumber: item.serial_number,
      warrantyId: item.warranty_id,
      warrantyCode: item.warranty_code,
      warrantyStatus: item.warranty.status,
      status: item.status,
      activatedAt: item.activated_at?.toISOString() ?? null,
    })),
    itemCount: request.items?.length ? request.items.length : undefined,
    metadata: toMetadata(request.metadata),
    createdAt: request.created_at.toISOString(),
    updatedAt: request.updated_at.toISOString(),
  };
}

function toCertificateSummary(
  requestId: string,
  certificate: {
    id: string;
    certificate_number: string;
    status: warranty_certificate_status;
    storage_key: string | null;
    recipient_email: string | null;
    generated_at: Date | null;
    emailed_at: Date | null;
    email_status: warranty_certificate_email_status;
    last_error: string | null;
  } | null,
) {
  if (!certificate) return null;

  return {
    id: certificate.id,
    scope: 'ACTIVATION_REQUEST' as const,
    certificateNumber: certificate.certificate_number,
    downloadUrl: `/warranty-activation-requests/${requestId}/certificate/download`,
    status: certificate.status,
    storageKey: certificate.storage_key,
    viewUrl: `/warranty-activation-requests/${requestId}/certificate/view`,
    recipientEmail: certificate.recipient_email,
    generatedAt: certificate.generated_at?.toISOString() ?? null,
    emailedAt: certificate.emailed_at?.toISOString() ?? null,
    emailStatus: certificate.email_status,
    lastError: certificate.last_error,
  };
}
