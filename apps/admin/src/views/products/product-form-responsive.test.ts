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
const catalogueMetadataFieldsUrl = new URL(
  "./components/product-catalogue-metadata-fields.tsx",
  import.meta.url,
);
const productMediaFieldsUrl = new URL(
  "./components/product-media-fields.tsx",
  import.meta.url,
);
const productFormViewUrl = new URL("./product-form.view.tsx", import.meta.url);

test("product form fields cannot widen the mobile layout", async () => {
  const [productForm, formField, productMediaFields, productFormView] =
    await Promise.all([
      readFile(productFormUrl, "utf8"),
      readFile(formFieldUrl, "utf8"),
      readFile(productMediaFieldsUrl, "utf8"),
      readFile(productFormViewUrl, "utf8"),
    ]);

  assert.match(productForm, /<form className="min-w-0 space-y-4"/);
  assert.match(formField, /className="min-w-0 space-y-2"/);
  assert.match(productForm, /className="grid min-w-0 gap-5 md:grid-cols-2"/);
  assert.match(
    productForm,
    /xl:grid-cols-\[minmax\(0,1fr\)_minmax\(320px,0\.42fr\)\]/,
  );
  assert.match(productForm, /<ProductMediaFields/);
  assert.match(productMediaFields, /<aside/);
  assert.match(productMediaFields, /xl:col-start-2/);
  assert.match(productFormView, /maxWidthClassName="max-w-7xl"/);
  assert.doesNotMatch(productForm, /xl:grid-cols-3/);
});

test("product form persists its direct installation position metadata", async () => {
  const [productForm, productUtils] = await Promise.all([
    readFile(productFormUrl, "utf8"),
    readFile(new URL("./products.utils.ts", import.meta.url), "utf8"),
  ]);

  assert.match(productForm, /product-installation-position/);
  assert.match(productForm, /register\("installationPosition"\)/);
  assert.match(productUtils, /metadata\.installationPosition/);
});

test("product form uses displayName as its single product name field", async () => {
  const [productForm, productUtils] = await Promise.all([
    readFile(productFormUrl, "utf8"),
    readFile(new URL("./products.utils.ts", import.meta.url), "utf8"),
  ]);

  assert.match(productForm, /register\("displayName"\)/);
  assert.doesNotMatch(productForm, /register\("name"\)/);
  assert.match(productUtils, /name: values\.displayName/);
  assert.match(productUtils, /displayName: values\.displayName/);
});

test("product form manages cover and gallery images on the product", async () => {
  const [productForm, productMediaFields, productUtils] = await Promise.all([
    readFile(productFormUrl, "utf8"),
    readFile(productMediaFieldsUrl, "utf8"),
    readFile(new URL("./products.utils.ts", import.meta.url), "utf8"),
  ]);

  assert.match(productForm, /<ProductMediaFields/);
  assert.match(productMediaFields, /name="coverImageUrl"/);
  assert.ok(productMediaFields.includes("name={`galleryImages.${index}.url`}"));
  assert.match(productMediaFields, /folder: "products"/);
  assert.match(productUtils, /coverAssetId/);
  assert.match(productUtils, /galleryAssetIds/);
});

test("product form edits catalogue metadata directly on the product", async () => {
  const [productForm, metadataFields, productUtils] = await Promise.all([
    readFile(productFormUrl, "utf8"),
    readFile(catalogueMetadataFieldsUrl, "utf8"),
    readFile(new URL("./products.utils.ts", import.meta.url), "utf8"),
  ]);

  assert.match(productForm, /ProductCatalogueMetadataFields/);
  assert.match(metadataFields, /form\.features\.fields/);
  assert.match(metadataFields, /form\.applications\.fields/);
  assert.match(metadataFields, /form\.specifications\.fields/);
  assert.match(metadataFields, /lg:grid-cols-2/);
  assert.match(metadataFields, /minmax\(0,1fr\)/);
  assert.match(productUtils, /catalogueMetadata/);
  assert.match(productUtils, /mergeProductCatalogueMetadata/);

  const warrantyTermsIndex = productForm.indexOf("product-warranty-terms");
  const catalogueMetadataIndex = productForm.indexOf(
    "<ProductCatalogueMetadataFields",
  );
  assert.ok(catalogueMetadataIndex > warrantyTermsIndex);
});
