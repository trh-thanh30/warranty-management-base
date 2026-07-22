import assert from "node:assert/strict";
import test from "node:test";
import type { VietnamProvince } from "@/src/services/locations/locations.types";
import { parseVietnamAddress } from "./location.ts";

const provinces = [
  {
    code: 79,
    codename: "thanh_pho_ho_chi_minh",
    division_type: "thành phố trung ương",
    name: "Thành phố Hồ Chí Minh",
    phone_code: 28,
  },
] satisfies VietnamProvince[];

test("parseVietnamAddress extracts detail, ward and province", () => {
  const result = parseVietnamAddress(
    "12 Nguyen Hue, Phường Sài Gòn, Thành phố Hồ Chí Minh",
    provinces,
  );

  assert.equal(result.detail, "12 Nguyen Hue");
  assert.equal(result.wardName, "Phường Sài Gòn");
  assert.equal(result.province?.code, 79);
});

test("parseVietnamAddress preserves an unstructured address", () => {
  const result = parseVietnamAddress("12 Nguyen Hue", provinces);

  assert.equal(result.detail, "12 Nguyen Hue");
  assert.equal(result.province, undefined);
  assert.equal(result.wardName, null);
});
