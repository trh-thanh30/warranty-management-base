import assert from "node:assert/strict";
import test from "node:test";
import type { ProductResponse } from "@repo/shared";
import {
  formatActivationProductSearchOption,
  getActivationProductDisplayName,
} from "./warranty-activation-request-product.utils.ts";

test("activation product display name prefers the physical product name", () => {
  const product = {
    displayName: "Phim cách nhiệt B C",
    name: "Phim cách nhiệt ô tô",
    productCode: "PRD-2026-7ZBTFW",
  } as ProductResponse;

  assert.equal(getActivationProductDisplayName(product), "Phim cách nhiệt B C");
});

test("activation product display name falls back to the template name", () => {
  const product = {
    displayName: "  ",
    name: "Phim cách nhiệt ô tô",
    productCode: "PRD-2026-7ZBTFW",
  } as ProductResponse;

  assert.equal(
    getActivationProductDisplayName(product),
    "Phim cách nhiệt ô tô",
  );
});

test("activation product search option starts with the physical product name", () => {
  const product = {
    displayName: "Phim cách nhiệt B C",
    name: "Phim cách nhiệt ô tô",
    owner: { fullName: "Nguyễn Văn A" },
    serialNumber: "SN-001",
    warrantyCode: "WM-2026-001",
  } as ProductResponse;

  assert.equal(
    formatActivationProductSearchOption(product),
    "Phim cách nhiệt B C · WM-2026-001 · SN-001 · Nguyễn Văn A",
  );
});
