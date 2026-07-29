import { ServiceCenter } from '@prisma/client';
import { createGoogleMapsUrl } from '@repo/shared/utils';

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
    googleMapsUrl: createGoogleMapsUrl(serviceCenter),
    latitude: serviceCenter.latitude,
    longitude: serviceCenter.longitude,
    isActive: serviceCenter.is_active,
    metadata,
    createdAt: serviceCenter.created_at,
    updatedAt: serviceCenter.updated_at,
  };
}
