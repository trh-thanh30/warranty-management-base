import type { HttpGet, HttpWrite } from "../service.types";

export type ActivationCodesHttpClient = {
  get: HttpGet;
  post: HttpWrite;
};
