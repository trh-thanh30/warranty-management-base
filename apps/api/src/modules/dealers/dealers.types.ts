import { Dealer, Prisma } from '@prisma/client';
import type { DealerActivatedCustomerSummary } from '@repo/shared';
import { createGoogleMapsUrl } from '@repo/shared/utils';

export function toDealerResponse(dealer: Dealer) {
  return {
    id: dealer.id,
    name: dealer.name,
    phone: dealer.phone,
    address: dealer.address,
    province: dealer.province,
    district: dealer.district,
    googleMapsUrl:
      dealer.latitude !== null && dealer.longitude !== null
        ? createGoogleMapsUrl({
            latitude: dealer.latitude,
            longitude: dealer.longitude,
          })
        : '',
    latitude: dealer.latitude,
    longitude: dealer.longitude,
    salesName: dealer.sales_name,
    isActive: dealer.is_active,
    metadata: toMetadata(dealer.metadata),
    createdAt: dealer.created_at,
    updatedAt: dealer.updated_at,
  };
}

export function toDealerActivatedCustomerResponse(request: {
  id: string;
  customer: {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
  product: {
    id: string;
    display_name: string | null;
    product_code: string;
    serial_number: string | null;
  } | null;
  activated_warranty: {
    id: string;
    warranty_code: string | null;
    status: DealerActivatedCustomerSummary['warranty']['status'];
    start_date: Date | null;
    end_date: Date | null;
    duration_months: number;
  } | null;
  reviewed_at: Date | null;
}): DealerActivatedCustomerSummary {
  if (!request.customer || !request.activated_warranty) {
    throw new Error('Activated request is missing customer or warranty');
  }

  return {
    id: request.id,
    customer: {
      id: request.customer.id,
      fullName: request.customer.full_name,
      phone: request.customer.phone,
      email: request.customer.email,
    },
    product: {
      id: request.product?.id ?? null,
      name: request.product?.display_name ?? null,
      productCode: request.product?.product_code ?? null,
      serialNumber: request.product?.serial_number ?? null,
    },
    warranty: {
      id: request.activated_warranty.id,
      warrantyCode: request.activated_warranty.warranty_code ?? '',
      status: request.activated_warranty.status,
      startDate: request.activated_warranty.start_date?.toISOString() ?? null,
      endDate: request.activated_warranty.end_date?.toISOString() ?? null,
      durationMonths: request.activated_warranty.duration_months,
    },
    activatedAt:
      request.activated_warranty.start_date?.toISOString() ??
      request.reviewed_at?.toISOString() ??
      null,
  };
}

export function normalizeDealerMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Prisma.InputJsonObject | typeof Prisma.JsonNull | undefined {
  if (metadata === undefined) return undefined;
  if (!metadata || Object.keys(metadata).length === 0) {
    return Prisma.JsonNull;
  }

  return metadata as Prisma.InputJsonObject;
}

export function toMetadata(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return null;
  }

  return value;
}
