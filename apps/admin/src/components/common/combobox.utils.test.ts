import assert from "node:assert/strict";
import test from "node:test";
import { filterComboboxItem, normalizeComboboxSearch } from "./combobox.utils";

test("normalizes Vietnamese text for case-insensitive search", () => {
  assert.equal(normalizeComboboxSearch("Thành Phố Hà Nội"), "thanh pho ha noi");
  assert.equal(normalizeComboboxSearch("Đồng Nai"), "dong nai");
});

test("matches visible labels with accented and unaccented partial queries", () => {
  assert.equal(filterComboboxItem("1", "Hà Nội", ["Thành phố Hà Nội"]), 1);
  assert.equal(filterComboboxItem("1", "ha noi", ["Thành phố Hà Nội"]), 1);
  assert.equal(filterComboboxItem("1", "noi", ["Thành phố Hà Nội"]), 1);
});

test("keeps code search and rejects unrelated terms", () => {
  assert.equal(filterComboboxItem("1", "1", ["Thành phố Hà Nội"]), 1);
  assert.equal(filterComboboxItem("1", "Đà Nẵng", ["Thành phố Hà Nội"]), 0);
});
