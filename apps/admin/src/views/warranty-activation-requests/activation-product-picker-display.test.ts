import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("activation product options omit warranty badges and codes and clamp names to two lines", () => {
  const result = source("./components/product-search-result.tsx");
  assert.doesNotMatch(result, /statusLabel|warrantyCode/);
  assert.match(result, /line-clamp-2/);
  assert.match(result, /whitespace-normal/);
});

test("position picker summary clamps names to two lines and hides warranty codes", () => {
  const field = source("./components/activation-product-select-field.tsx");
  assert.match(field, /line-clamp-2/);
  assert.doesNotMatch(field, /selectedProduct\.warrantyCode/);
  assert.match(field, /filter\(isVisibleActivationProductOption\)/);
  assert.match(
    source("./hooks/use-create-warranty-activation-request-form.ts"),
    /filter\(isVisibleActivationProductOption\)/,
  );
});
