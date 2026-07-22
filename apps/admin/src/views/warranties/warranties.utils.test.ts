import assert from "node:assert/strict";
import test from "node:test";
import {
  formatWarrantyMoneyLimit,
  isValidWarrantyAmount,
} from "./warranties.utils";

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
