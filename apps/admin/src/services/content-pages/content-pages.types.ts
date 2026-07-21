import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type ContentPagesHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  patch: HttpWrite;
  post: HttpWrite;
};
