import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductTemplateDefaults,
  toCreateTemplateBody,
  toUpdateTemplateBody,
} from "./product-templates.utils.ts";

const formValues = {
  brand: " 3M ",
  categoryId: "category-id",
  coverAssetId: "",
  coverImageUrl: "",
  defaultWarrantyDurationMonths: 36,
  defaultWarrantyTerms: " Standard warranty ",
  description: " Template description ",
  galleryImages: [],
  isActive: true,
  isPublished: true,
  model: " CR70 ",
  modelYear: 2026,
  name: " CR70 Premium ",
  sku: " ",
  slug: "",
  specifications: [{ key: " UV ", value: " 99% " }],
};

test("leaves blank SKU and slug out so the API can generate them", () => {
  assert.deepEqual(toCreateTemplateBody(formValues), {
    brand: "3M",
    categoryId: "category-id",
    coverAssetId: undefined,
    defaultWarrantyDurationMonths: 36,
    defaultWarrantyTerms: "Standard warranty",
    description: "Template description",
    galleryAssetIds: [],
    isPublished: true,
    metadata: {
      specifications: [{ key: "UV", value: "99%" }],
    },
    model: "CR70",
    modelYear: 2026,
    name: "CR70 Premium",
    sku: undefined,
    slug: undefined,
  });
});

test("maps editable catalog identifiers and publication on update", () => {
  assert.deepEqual(
    toUpdateTemplateBody({
      ...formValues,
      sku: " cr70-premium ",
      slug: " cr70-premium ",
    }),
    {
      brand: "3M",
      categoryId: "category-id",
      coverAssetId: null,
      defaultWarrantyDurationMonths: 36,
      defaultWarrantyTerms: "Standard warranty",
      description: "Template description",
      galleryAssetIds: [],
      isActive: true,
      isPublished: true,
      metadata: {
        specifications: [{ key: "UV", value: "99%" }],
      },
      model: "CR70",
      modelYear: 2026,
      name: "CR70 Premium",
      sku: "cr70-premium",
      slug: "cr70-premium",
    },
  );
});

test("uses API-generated SKU, slug and model year as edit defaults", () => {
  const defaults = getProductTemplateDefaults({
    assets: [],
    brand: null,
    categoryId: "category-id",
    categoryRef: null,
    createdAt: "2026-07-26T00:00:00.000Z",
    defaultWarrantyDurationMonths: 24,
    defaultWarrantyTerms: null,
    description: null,
    id: "template-id",
    isActive: true,
    isPublished: false,
    metadata: null,
    model: null,
    modelYear: 2025,
    name: "Template",
    productCount: 0,
    publishedAt: null,
    sku: "template",
    slug: "template",
    updatedAt: "2026-07-26T00:00:00.000Z",
  });

  assert.equal(defaults.sku, "template");
  assert.equal(defaults.slug, "template");
  assert.equal(defaults.modelYear, 2025);
  assert.equal(defaults.isPublished, false);
});
