import assert from "node:assert/strict";
import test from "node:test";
import type { ProductResponse } from "@repo/shared";
import { formatProductSearchOption } from "./product.ts";

test("product search option includes searchable product identifiers", () => {
  const product = {
    name: "Black Label Premium",
    warrantyCode: "WM-2026-001",
  } as ProductResponse;

  assert.equal(
    formatProductSearchOption(product),
    "Black Label Premium · WM-2026-001",
  );
});
