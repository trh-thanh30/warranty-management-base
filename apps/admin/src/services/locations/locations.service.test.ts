import assert from "node:assert/strict";
import test from "node:test";
import { createLocationsService } from "./create-locations.service.ts";
import type { LocationsHttpClient } from "./locations.types.ts";

test("lists Vietnam provinces through the locations API", async () => {
  const calls: unknown[] = [];
  const provinces = [
    {
      code: 48,
      codename: "da_nang",
      division_type: "thành phố trung ương",
      name: "Thành phố Đà Nẵng",
      phone_code: 236,
    },
  ];
  const http = {
    async get(url: string) {
      calls.push({ url });
      return { data: { success: true, data: provinces } };
    },
  };

  const result = await createLocationsService(
    http as unknown as LocationsHttpClient,
  ).listVietnamProvinces();

  assert.deepEqual(calls, [{ url: "/locations/vietnam/provinces" }]);
  assert.deepEqual(result, provinces);
});

test("lists Vietnam wards filtered by province code", async () => {
  const calls: unknown[] = [];
  const wards = [
    {
      code: 20257,
      codename: "phuong_hai_chau",
      division_type: "phường",
      name: "Phường Hải Châu",
      province_code: 48,
    },
  ];
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: wards } };
    },
  };

  const result = await createLocationsService(
    http as unknown as LocationsHttpClient,
  ).listVietnamWards(48);

  assert.deepEqual(calls, [
    {
      url: "/locations/vietnam/wards",
      config: { params: { province: 48 } },
    },
  ]);
  assert.deepEqual(result, wards);
});
