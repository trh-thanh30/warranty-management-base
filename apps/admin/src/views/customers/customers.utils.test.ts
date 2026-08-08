import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCustomerAddress,
  deduplicateAddressSuffix,
  fillCustomerAddressSelection,
  getCustomerAddressSelection,
} from "./customers.utils.ts";

test("waits for a ward before filling the address detail", () => {
  assert.equal(
    getCustomerAddressSelection({
      provinceName: "Thành phố Hồ Chí Minh",
      wardName: "",
    }),
    "",
  );
});

test("fills the selected ward and province into the address detail", () => {
  assert.equal(
    fillCustomerAddressSelection({
      currentAddress: "",
      previousSelection: "",
      provinceName: "Thành phố Hồ Chí Minh",
      wardName: "Phường Sài Gòn",
    }),
    "Phường Sài Gòn, Thành phố Hồ Chí Minh",
  );
});

test("updates a previous auto-filled location without removing street detail", () => {
  assert.equal(
    fillCustomerAddressSelection({
      currentAddress: "12 Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh",
      previousSelection: "Phường Sài Gòn, Thành phố Hồ Chí Minh",
      provinceName: "Thành phố Hồ Chí Minh",
      wardName: "Phường Bến Thành",
    }),
    "12 Nguyễn Huệ, Phường Bến Thành, Thành phố Hồ Chí Minh",
  );
});

test("does not append the selected location twice when saving", () => {
  assert.equal(
    buildCustomerAddress({
      addressDetail: "12 Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh",
      provinceName: "Thành phố Hồ Chí Minh",
      wardName: "Phường Sài Gòn",
    }),
    "12 Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh",
  );
});

test("removes a repeated address suffix", () => {
  assert.equal(
    deduplicateAddressSuffix(
      "Phường Ba Đình, Thành phố Hà Nội, Phường Ba Đình, Thành phố Hà Nội",
    ),
    "Phường Ba Đình, Thành phố Hà Nội",
  );
});
