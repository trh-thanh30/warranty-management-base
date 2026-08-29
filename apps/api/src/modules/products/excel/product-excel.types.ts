import { product_status } from '@prisma/client';

export type ProductExcelRow = {
  productCode: string | null;
  productName: string;
  categoryCode: string;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  warrantyDurationMonths: number;
  warrantyTerms: string | null;
  displayName: string | null;
  installationPosition: string | null;
  warrantyCode: string | null;
  serialNumber: string | null;
  status: product_status;
};
