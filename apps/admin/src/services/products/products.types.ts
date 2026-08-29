import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type ProductsHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};

export type ProductImportRowData = {
  productCode: string | null;
  displayName: string;
  categoryCode: string;
  brand: string | null;
  model: string | null;
  modelYear: number | null;
  warrantyDurationMonths: number;
  warrantyTerms: string | null;
  installationPosition: string | null;
  warrantyCode: string | null;
  serialNumber: string | null;
  status: "ACTIVE" | "INACTIVE";
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
