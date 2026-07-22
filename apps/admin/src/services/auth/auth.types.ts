import type { HttpGet, HttpWrite } from "../service.types";

export type AuthHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
