import type { HttpGet, HttpWrite } from "../service.types";

export type ServiceCentersHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
