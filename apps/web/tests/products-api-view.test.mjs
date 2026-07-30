import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const productsViewUrl = new URL(
  "../src/views/products/products.view.tsx",
  import.meta.url,
);
const productCoverImageUrl = new URL(
  "../src/views/products/components/product-cover-image.tsx",
  import.meta.url,
);

test("product cover uses a neutral placeholder instead of a mock product image", async () => {
  const source = await readFile(productCoverImageUrl, "utf8");

  assert.match(source, /if \(!src \|\| hasError\)/);
  assert.match(source, /ImageOff/);
  assert.match(source, /onError=\{\(\) => setHasError\(true\)\}/);
  assert.doesNotMatch(
    source,
    /feat1\.jpg|product_1\.jpg|PRODUCT_META|productCatalogItems/,
  );
});

test("products view uses public API data without mock catalog fallback", async () => {
  const source = await readFile(productsViewUrl, "utf8");

  assert.doesNotMatch(source, /expandedProductsCatalog|catalogCategories/);
  assert.doesNotMatch(source, /catalog\.items\./);
  assert.match(source, /useProductsCatalog/);
  assert.match(source, /product\.name/);
  assert.match(source, /product\.category\?\.name/);
  assert.match(source, /product\.sku/);
  assert.match(source, /product\.specifications/);
  assert.match(source, /product\.coverImageUrl/);
  assert.doesNotMatch(source, /product\.productCode/);
});

test("products view exposes loading, error, retry, and honest empty states", async () => {
  const source = await readFile(productsViewUrl, "utf8");

  assert.match(source, /productsQuery\.isPending/);
  assert.match(source, /productsQuery\.isError/);
  assert.match(source, /productsQuery\.refetch/);
  assert.match(source, /categoriesQuery\.isError/);
  assert.match(source, /catalog\.noProductsTitle/);
  assert.match(source, /catalog\.loadErrorTitle/);
});

test("API products navigate to the public product detail page", async () => {
  const source = await readFile(productsViewUrl, "utf8");

  assert.match(source, /APP_ROUTES\.product\(product\.slug\)/);
  assert.doesNotMatch(source, /product-catalog\.constants/);
});
