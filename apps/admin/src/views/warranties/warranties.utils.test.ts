import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateWarrantyEndDate,
  formatWarrantyDateTimeInput,
  formatWarrantyDealerAddress,
  formatWarrantyMoneyLimit,
  isValidWarrantyAmount,
  isValidWarrantyDuration,
} from "./warranties.utils";

test("warranty edit previews the end date from installation date and duration", () => {
  assert.equal(
    calculateWarrantyEndDate("2026-07-08T10:10", 36)?.toISOString(),
    new Date(2029, 6, 8, 10, 10).toISOString(),
  );
});

test("warranty edit formats the stored start date for the date-time picker", () => {
  const storedDate = new Date(2026, 6, 8, 10, 10).toISOString();
  assert.equal(formatWarrantyDateTimeInput(storedDate), "2026-07-08T10:10");
});

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
