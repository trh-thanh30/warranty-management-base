import { warranty_status } from '@prisma/client';

export type WarrantyExcelRow = {
  warrantyCode: string | null;
  productCode: string;
  productName: string;
  serialNumber: string | null;
  ownerCustomerCode: string | null;
  ownerFullName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  durationMonths: number;
  status: warranty_status;
  terms: string | null;
};
