import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type ProductsHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};

export type ProductImportRowData = {
  brand: string | null;
  category: string;
  categoryCode: string | null;
  description: string | null;
  imageUrl: string | null;
  installationPosition: string | null;
  manufactureYear: number | null;
  model: string | null;
  name: string;
  productCode: string | null;
  serialNumber: string | null;
  status: string;
  warrantyDurationMonths: number | null;
  warrantyTerms: string | null;
};

export type ProductImportRowError = {
  field: string;
  message: string;
  rowNumber: number;
};

export type ProductImportPreview = {
  errors: ProductImportRowError[];
  invalidRows: number;
  rows: Array<{
    data: Partial<ProductImportRowData>;
    errors: ProductImportRowError[];
    rowNumber: number;
  }>;
  totalRows: number;
  validRows: number;
};

export type ConfirmProductImportBody = {
  mode: "replace" | "upsert";
  rows: ProductImportRowData[];
};

export type ProductImportConfirmResult = {
  created: number;
  deactivated: number;
  errors: ProductImportRowError[];
  updated: number;
};
