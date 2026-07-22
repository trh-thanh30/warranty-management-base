import assert from "node:assert/strict";
import test from "node:test";
import { formatVndInputValue, normalizeVndInputValue } from "./currency";

test("formatVndInputValue adds Vietnamese grouping separators", () => {
  assert.equal(formatVndInputValue("70000000"), "70.000.000");
  assert.equal(formatVndInputValue("20000"), "20.000");
  assert.equal(formatVndInputValue("1000"), "1.000");
});

test("formatVndInputValue displays a comma decimal separator", () => {
  assert.equal(formatVndInputValue("70000000.5"), "70.000.000,5");
  assert.equal(formatVndInputValue("70000000."), "70.000.000,");
});

test("normalizeVndInputValue converts display values to API decimals", () => {
  assert.equal(normalizeVndInputValue("70.000.000"), "70000000");
  assert.equal(normalizeVndInputValue("70.000.000,50"), "70000000.50");
  assert.equal(normalizeVndInputValue("1 000,5"), "1000.5");
  assert.equal(normalizeVndInputValue(""), "");
});

test("normalizeVndInputValue rejects unsupported characters and precision", () => {
  assert.equal(normalizeVndInputValue("1.000,123"), null);
  assert.equal(normalizeVndInputValue("1,2,3"), null);
  assert.equal(normalizeVndInputValue("1 triệu"), null);
});
