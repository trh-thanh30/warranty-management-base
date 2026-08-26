import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type CustomersHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
  delete: HttpDelete;
};

export type CustomerImportResult = {
  created: number;
  updated: number;
  errors: Array<{
    field: string;
    message: string;
    rowNumber: number;
  }>;
};
