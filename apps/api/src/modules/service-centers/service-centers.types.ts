import { Prisma, ServiceCenter } from '@prisma/client';

export function toServiceCenterResponse(serviceCenter: ServiceCenter) {
  const metadata = serviceCenter.metadata as Record<string, unknown> | null;

  return {
    id: serviceCenter.id,
    name: serviceCenter.name,
    phone: serviceCenter.phone,
    email: serviceCenter.email,
    province: serviceCenter.province,
    district: serviceCenter.district,
    address: serviceCenter.address,
    googleMapsUrl: getStringMetadataValue(metadata, 'googleMapsUrl'),
    isActive: serviceCenter.is_active,
    metadata,
    createdAt: serviceCenter.created_at,
    updatedAt: serviceCenter.updated_at,
  };
}

export function buildServiceCenterMetadata(
  currentMetadata: Record<string, unknown> | null | undefined,
  googleMapsUrl: string | undefined,
): Prisma.InputJsonObject | typeof Prisma.JsonNull | undefined {
  if (googleMapsUrl === undefined) {
    return currentMetadata
      ? ({ ...currentMetadata } as Prisma.InputJsonObject)
      : undefined;
  }

  const metadata = { ...(currentMetadata ?? {}) } as Record<
    string,
    Prisma.InputJsonValue
  >;
  const normalizedUrl = googleMapsUrl.trim();

  if (normalizedUrl) {
    metadata.googleMapsUrl = normalizedUrl;
  } else {
    delete metadata.googleMapsUrl;
  }

  return Object.keys(metadata).length > 0 ? metadata : Prisma.JsonNull;
}

function getStringMetadataValue(
  metadata: Record<string, unknown> | null,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}
