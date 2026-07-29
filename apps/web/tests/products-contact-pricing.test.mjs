import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const productsViewUrl = new URL(
  "../src/views/products/products.view.tsx",
  import.meta.url,
);

test("product catalog removes unsupported price filters and metadata", async () => {
  const source = await readFile(productsViewUrl, "utf8");

  assert.doesNotMatch(source, /PRODUCT_META/);
  assert.doesNotMatch(source, /PRICE_RANGE_OPTIONS/);
  assert.doesNotMatch(source, /selectedPriceRange/);
  assert.doesNotMatch(source, /price-asc|price-desc/);
  assert.doesNotMatch(source, /meta\.badge|meta\.priceFormatted/);
});

test("product cards use a prominent contact action and supported name sorting", async () => {
  const source = await readFile(productsViewUrl, "utf8");

  assert.match(source, /catalog\.contactForPrice/);
  assert.match(source, /PhoneCall/);
  assert.equal(source.match(/href=\{APP_ROUTES\.contact\}/g)?.length, 2);
  assert.equal(source.match(/border-premium-red bg-white/g)?.length, 2);
  assert.doesNotMatch(source, /bg-premium-red\/5/);
  assert.equal(
    source.match(/text-sm font-semibold uppercase text-premium-red/g)?.length,
    2,
  );
  assert.match(source, /line-clamp-3 text-base font-semibold uppercase/);
  assert.match(source, /min-h-\[2\.5rem\] text-base font-semibold uppercase/);
  assert.match(source, /name-asc/);
  assert.match(source, /name-desc/);
});
