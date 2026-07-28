import type { HttpGet, HttpWrite } from "../service.types";

export type LocationsHttpClient = {
  get: HttpGet;
  post: HttpWrite;
};

export type VietnamProvince = {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  phone_code: number;
};

export type VietnamWard = {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
};
