export interface VietnamProvince {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  phone_code: number;
  wards?: VietnamWard[] | null;
}

export interface VietnamWard {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
}

export interface VietnamLegacyWard {
  code: number;
  codename: string;
  district_code: number;
  division_type: string;
  name: string;
  province_code: number;
}

export interface VietnamLegacyWardLookupResult {
  source_code: number;
  ward: VietnamWard;
}
