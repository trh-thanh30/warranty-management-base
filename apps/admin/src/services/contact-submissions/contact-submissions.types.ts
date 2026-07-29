import type { HttpGet, HttpWrite } from "../service.types";

export type ContactSubmissionsHttpClient = {
  get: HttpGet;
  patch: HttpWrite;
};
