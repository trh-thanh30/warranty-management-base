import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const detailViewUrl = new URL(
  "../src/views/product-detail/product-detail.view.tsx",
  import.meta.url,
);
const productsViewUrl = new URL(
  "../src/views/products/products.view.tsx",
  import.meta.url,
);

test("product detail reads the public API contract without mock fallback", async () => {
  const source = await readFile(detailViewUrl, "utf8");

  assert.doesNotMatch(source, /findProductBySlug|filmCatalogMap|defaultFilm/);
  assert.match(source, /productsService\.getProductDetail/);
  assert.match(source, /product\.name/);
  assert.match(source, /product\.category\.name/);
  assert.match(source, /product\.specifications/);
  assert.match(source, /product\.features/);
  assert.match(source, /product\.applications/);
  assert.match(source, /product\.warranty/);
  assert.match(source, /product\.galleryImages/);
});

test("product cards link API products to their public detail slug", async () => {
  const source = await readFile(productsViewUrl, "utf8");

  assert.match(source, /APP_ROUTES\.product\(product\.slug\)/);
  assert.match(source, /t\("viewDetails"\)/);
});

test("product detail actions keep long labels on one line on mobile", async () => {
  const source = await readFile(detailViewUrl, "utf8");

  assert.match(source, /whitespace-nowrap/);
  assert.match(source, /px-3 text-xs/);
  assert.match(source, /sm:px-5 sm:text-sm/);
});

test("desktop product summary balances with the image without framing the introduction", async () => {
  const source = await readFile(detailViewUrl, "utf8");

  assert.match(source, /lg:items-stretch/);
  assert.match(source, /min-w-0 lg:flex lg:h-full lg:flex-col/);
  assert.match(source, /mt-6 lg:mt-auto/);
  assert.match(source, /<section className="bg-surface-muted py-10 sm:py-14">/);
});
