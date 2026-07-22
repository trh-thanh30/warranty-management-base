import type { HttpGet, HttpWrite } from "../service.types";

export type WarrantiesHttpClient = {
  get: HttpGet;
  post: HttpWrite;
};
