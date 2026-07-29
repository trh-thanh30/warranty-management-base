import { DealerExcelRow } from '@/modules/dealers/excel/dealer-excel.types';
import { Dealer } from '@prisma/client';

export function toDealerExcelRow(dealer: Dealer): DealerExcelRow {
  return {
    address: dealer.address,
    isActive: dealer.is_active,
    name: dealer.name,
    phone: dealer.phone,
    province: dealer.province,
    district: dealer.district,
    latitude: dealer.latitude,
    longitude: dealer.longitude,
    salesName: dealer.sales_name,
  };
}
