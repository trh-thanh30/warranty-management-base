import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type DealersHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
