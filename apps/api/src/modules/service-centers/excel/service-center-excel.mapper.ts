import { ServiceCenterExcelRow } from '@/modules/service-centers/excel/service-center-excel.types';
import { ServiceCenter } from '@prisma/client';

export function toServiceCenterExcelRow(
  serviceCenter: ServiceCenter,
): ServiceCenterExcelRow {
  const metadata = serviceCenter.metadata as Record<string, unknown> | null;
  const googleMapsUrl = metadata?.googleMapsUrl;

  return {
    name: serviceCenter.name,
    phone: serviceCenter.phone,
    email: serviceCenter.email,
    province: serviceCenter.province,
    district: serviceCenter.district,
    address: serviceCenter.address,
    googleMapsUrl:
      typeof googleMapsUrl === 'string' && googleMapsUrl.trim()
        ? googleMapsUrl
        : null,
    isActive: serviceCenter.is_active,
  };
}
