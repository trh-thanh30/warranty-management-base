import { product_status } from '@prisma/client';

export type ProductExcelRow = {
  productCode: string | null;
  displayName: string;
  categoryCode: string;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  shortDescription?: string | null;
  description?: string | null;
  warrantyDurationMonths: number;
  warrantyTerms: string | null;
  installationPosition: string | null;
  status: product_status;
};
