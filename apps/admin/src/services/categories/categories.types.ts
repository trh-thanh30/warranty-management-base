import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type CategoriesHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
  put: HttpWrite;
};
