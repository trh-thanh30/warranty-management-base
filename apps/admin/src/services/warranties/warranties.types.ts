import type { HttpGet, HttpWrite } from "../service.types";

export type WarrantiesHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
