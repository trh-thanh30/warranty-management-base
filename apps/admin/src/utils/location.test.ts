import assert from "node:assert/strict";
import test from "node:test";
import type { VietnamProvince } from "@/src/services/locations/locations.types";
import {
  fillVietnamAddressSelection,
  getVietnamAddressSelection,
  parseVietnamAddress,
} from "./location.ts";

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

test("fills a selected province into an empty address", () => {
  assert.equal(
    fillVietnamAddressSelection({
      currentAddress: "",
      previousSelection: "",
      province: "Thành phố Hà Nội",
      ward: "",
    }),
    "Thành phố Hà Nội",
  );
});

test("fills a selected ward before its province", () => {
  assert.equal(
    fillVietnamAddressSelection({
      currentAddress: "12 Nguyễn Trãi, Thành phố Hà Nội",
      previousSelection: "Thành phố Hà Nội",
      province: "Thành phố Hà Nội",
      ward: "Phường Thanh Xuân",
    }),
    "12 Nguyễn Trãi, Phường Thanh Xuân, Thành phố Hà Nội",
  );
});

test("replaces the previous location without removing the street detail", () => {
  assert.equal(
    fillVietnamAddressSelection({
      currentAddress: "12 Nguyễn Trãi, Phường Thanh Xuân, Thành phố Hà Nội",
      previousSelection: "Phường Thanh Xuân, Thành phố Hà Nội",
      province: "Thành phố Đà Nẵng",
      ward: "",
    }),
    "12 Nguyễn Trãi, Thành phố Đà Nẵng",
  );
});

test("formats one shared ward and province suffix", () => {
  assert.equal(
    getVietnamAddressSelection({
      province: " Thành phố Hồ Chí Minh ",
      ward: " Phường Bến Thành ",
    }),
    "Phường Bến Thành, Thành phố Hồ Chí Minh",
  );
});
