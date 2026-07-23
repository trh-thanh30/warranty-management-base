import type { HttpGet, HttpWrite } from "../service.types";

export type DealersHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
