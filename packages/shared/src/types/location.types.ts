export type VietnamProvince = {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  phone_code: number;
  wards?: VietnamWard[] | null;
};

export type VietnamWard = {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
};

export type VietnamLegacyWard = {
  code: number;
  codename: string;
  district_code: number;
  division_type: string;
  name: string;
  province_code: number;
};

export type VietnamLegacyWardLookupResult = {
  source_code: number;
  ward: VietnamWard;
};
