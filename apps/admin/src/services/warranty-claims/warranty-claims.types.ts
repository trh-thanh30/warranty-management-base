import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type WarrantyClaimsHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
