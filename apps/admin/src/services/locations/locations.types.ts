import type { HttpGet } from "../service.types";
export type { VietnamProvince, VietnamWard } from "@repo/shared";

export type LocationsHttpClient = {
  get: HttpGet;
};
