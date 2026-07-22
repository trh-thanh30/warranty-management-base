import type { HttpGet } from "../service.types";

export type LocationsHttpClient = {
  get: HttpGet;
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
