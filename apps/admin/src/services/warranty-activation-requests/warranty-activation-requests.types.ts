import type { HttpGet, HttpWrite } from "../service.types";

export type WarrantyActivationRequestsHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
