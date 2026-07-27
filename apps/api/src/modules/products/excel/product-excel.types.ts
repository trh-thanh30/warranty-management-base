import { product_status } from '@prisma/client';

export type ProductExcelRow = {
  productCode: string | null;
  templateSku: string;
  displayName: string | null;
  installationPosition: string | null;
  serialNumber: string | null;
  status: product_status;
};
