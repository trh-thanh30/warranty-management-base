import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type ProductTemplatesHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
