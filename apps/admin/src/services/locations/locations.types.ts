import type { HttpGet, HttpWrite } from "../service.types";

export type { VietnamProvince, VietnamWard } from "@repo/shared";

export type LocationsHttpClient = {
  get: HttpGet;
  post: HttpWrite;
};
