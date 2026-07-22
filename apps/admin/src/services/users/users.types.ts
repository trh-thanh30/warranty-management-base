import type { HttpGet, HttpWrite } from "../service.types";

export type UsersHttpClient = {
  get: HttpGet;
  post: HttpWrite;
  put: HttpWrite;
};
