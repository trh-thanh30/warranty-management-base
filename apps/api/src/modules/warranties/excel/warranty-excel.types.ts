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
  coverageLimitAmount: string | null;
  maxClaimCount: number | null;
  maxAmountPerClaim: string | null;
  status: warranty_status;
  terms: string | null;
};
