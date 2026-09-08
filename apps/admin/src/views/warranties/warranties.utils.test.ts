import assert from "node:assert/strict";
import test from "node:test";
import {
  formatWarrantyDealerAddress,
  formatWarrantyMoneyLimit,
  isValidWarrantyAmount,
  isValidWarrantyDuration,
} from "./warranties.utils";

test("formatWarrantyDealerAddress does not duplicate location already in address", () => {
  assert.equal(
    formatWarrantyDealerAddress({
      address: "Phường Ngọc Hà, Thành phố Hà Nội",
      district: "Phường Ngọc Hà",
      province: "Thành phố Hà Nội",
    }),
    "Phường Ngọc Hà, Thành phố Hà Nội",
  );
});

test("formatWarrantyDealerAddress appends missing district and province", () => {
  assert.equal(
    formatWarrantyDealerAddress({
      address: "12 Nguyễn Trãi",
      district: "Thanh Xuân",
      province: "Hà Nội",
    }),
    "12 Nguyễn Trãi, Thanh Xuân, Hà Nội",
  );
});

test("formatWarrantyMoneyLimit returns fallback for an unlimited amount", () => {
  assert.equal(
    formatWarrantyMoneyLimit(null, "vi-VN", "Không giới hạn"),
    "Không giới hạn",
  );
});

test("formatWarrantyMoneyLimit formats whole and decimal VND amounts", () => {
  assert.equal(
    formatWarrantyMoneyLimit("1000000.00", "vi-VN", "-"),
    "1.000.000 VND",
  );
  assert.equal(
    formatWarrantyMoneyLimit("1000000.50", "en-US", "-"),
    "1,000,000.5 VND",
  );
});

test("isValidWarrantyAmount accepts nullable positive decimal strings", () => {
  assert.equal(isValidWarrantyAmount(null), true);
  assert.equal(isValidWarrantyAmount("0"), true);
  assert.equal(isValidWarrantyAmount("100.25"), true);
});

test("isValidWarrantyAmount rejects malformed or negative amounts", () => {
  assert.equal(isValidWarrantyAmount(""), false);
  assert.equal(isValidWarrantyAmount("-1"), false);
  assert.equal(isValidWarrantyAmount("1.234"), false);
  assert.equal(isValidWarrantyAmount("1,000"), false);
});

test("warranty duration has no upper month limit", () => {
  assert.equal(isValidWarrantyDuration(180), true);
  assert.equal(isValidWarrantyDuration(240), true);
  assert.equal(isValidWarrantyDuration(0), false);
  assert.equal(isValidWarrantyDuration(1.5), false);
});
