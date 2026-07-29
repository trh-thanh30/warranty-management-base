import type { HttpGet, HttpWrite } from "../service.types";

export type WebsiteConfigHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
