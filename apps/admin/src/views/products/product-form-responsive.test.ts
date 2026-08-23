import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const productFormUrl = new URL(
  "./components/product-form.tsx",
  import.meta.url,
);
const formFieldUrl = new URL(
  "../../components/common/form-field.tsx",
  import.meta.url,
);

test("product form fields cannot widen the mobile layout", async () => {
  const [productForm, formField] = await Promise.all([
    readFile(productFormUrl, "utf8"),
    readFile(formFieldUrl, "utf8"),
  ]);

  assert.match(productForm, /<form className="min-w-0 space-y-6"/);
  assert.match(formField, /className="min-w-0 space-y-2"/);
  assert.match(productForm, /className="grid min-w-0 gap-5 md:grid-cols-2"/);
  assert.doesNotMatch(productForm, /xl:grid-cols-3/);
});

test("product form temporarily hides the free-text installation position", async () => {
  const [productForm, productUtils] = await Promise.all([
    readFile(productFormUrl, "utf8"),
    readFile(new URL("./products.utils.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(productForm, /product-installation-position/);
  assert.doesNotMatch(productForm, /register\("installationPosition"\)/);
  assert.match(productUtils, /metadata\.installationPosition/);
});
