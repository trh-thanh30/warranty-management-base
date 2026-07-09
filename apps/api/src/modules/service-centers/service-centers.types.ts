import { ServiceCenter } from '@prisma/client';

export function toServiceCenterResponse(serviceCenter: ServiceCenter) {
  return {
    id: serviceCenter.id,
    name: serviceCenter.name,
    phone: serviceCenter.phone,
    email: serviceCenter.email,
    province: serviceCenter.province,
    district: serviceCenter.district,
    address: serviceCenter.address,
    isActive: serviceCenter.is_active,
    metadata: serviceCenter.metadata as Record<string, unknown> | null,
    createdAt: serviceCenter.created_at,
    updatedAt: serviceCenter.updated_at,
  };
}
