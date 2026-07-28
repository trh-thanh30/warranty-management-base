import { ServiceCenterExcelRow } from '@/modules/service-centers/excel/service-center-excel.types';
import { ServiceCenter } from '@prisma/client';

export function toServiceCenterExcelRow(
  serviceCenter: ServiceCenter,
): ServiceCenterExcelRow {
  return {
    name: serviceCenter.name,
    phone: serviceCenter.phone,
    email: serviceCenter.email,
    province: serviceCenter.province,
    district: serviceCenter.district,
    address: serviceCenter.address,
    latitude: serviceCenter.latitude,
    longitude: serviceCenter.longitude,
    isActive: serviceCenter.is_active,
  };
}
