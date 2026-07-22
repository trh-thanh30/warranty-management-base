import { product_category, product_status } from '@prisma/client';

export type ProductExcelRow = {
  productCode: string | null;
  name: string;
  imageUrl: string | null;
  category: product_category;
  categoryCode: string | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  serialNumber: string | null;
  status: product_status;
  warrantyDurationMonths: number | null;
  warrantyTerms: string | null;
  description: string | null;
};
