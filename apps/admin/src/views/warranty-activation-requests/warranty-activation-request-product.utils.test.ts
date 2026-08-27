import assert from "node:assert/strict";
import test from "node:test";
import type { ActivationProductOption, ProductResponse } from "@repo/shared";
import {
  getActivationProductOptionDisabledReason,
  formatActivationProductSearchOption,
  getActivationProductDisplayName,
} from "./warranty-activation-request-product.utils.ts";

const translate = ((key: string, values?: Record<string, string>): string =>
  values?.requestCode ? `${key}:${values.requestCode}` : key) as never;

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

test("activation product option uses the API reason and request code", () => {
  const product = {
    activationEligibility: {
      eligible: false,
      reason: "ACTIVATION_REQUEST_PENDING",
      requestCode: "WAR-20260827-0001",
    },
  } as ActivationProductOption;

  assert.equal(
    getActivationProductOptionDisabledReason(product, translate),
    "activationProductUnavailablePendingRequest:WAR-20260827-0001",
  );
});

test("eligible activation product option remains selectable", () => {
  const product = {
    activationEligibility: {
      eligible: true,
      reason: null,
      requestCode: null,
    },
  } as ActivationProductOption;

  assert.equal(
    getActivationProductOptionDisabledReason(product, translate),
    null,
  );
});
