import { Dealer, Prisma } from '@prisma/client';

export function toDealerResponse(dealer: Dealer) {
  return {
    id: dealer.id,
    name: dealer.name,
    phone: dealer.phone,
    address: dealer.address,
    province: dealer.province,
    district: dealer.district,
    salesName: dealer.sales_name,
    isActive: dealer.is_active,
    metadata: toMetadata(dealer.metadata),
    createdAt: dealer.created_at,
    updatedAt: dealer.updated_at,
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
