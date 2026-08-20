import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductTemplateDetailSections,
  getProductTemplateDefaults,
  toCreateTemplateBody,
  toUpdateTemplateBody,
} from "./product-templates.utils.ts";
import { productTemplateFormSchema } from "./product-templates.types.ts";

const formValues = {
  brand: " 3M ",
  categoryId: "category-id",
  coverAssetId: "",
  coverImageUrl: "",
  defaultWarrantyDurationMonths: 36,
  defaultWarrantyTerms: " Standard warranty ",
  description: " Template description ",
  shortDescription: " Short public summary ",
  features: [{ value: " Blocks infrared " }],
  applications: [{ value: " Windshield " }],
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
      applications: ["Windshield"],
      features: ["Blocks infrared"],
      shortDescription: "Short public summary",
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
        applications: ["Windshield"],
        features: ["Blocks infrared"],
        shortDescription: "Short public summary",
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
    defaultWarrantyDurationMonths: null,
    defaultWarrantyTerms: null,
    description: null,
    id: "template-id",
    isActive: true,
    isPublished: false,
    metadata: {
      applications: ["Side windows"],
      features: ["Heat rejection"],
      shortDescription: "Public summary",
      specifications: [{ key: "UV", value: "99%" }],
    },
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
  assert.equal(defaults.defaultWarrantyDurationMonths, "");
  assert.equal(defaults.isPublished, false);
  assert.equal(defaults.shortDescription, "Public summary");
  assert.deepEqual(defaults.features, [{ value: "Heat rejection" }]);
  assert.deepEqual(defaults.applications, [{ value: "Side windows" }]);
  assert.deepEqual(defaults.specifications, [{ key: "UV", value: "99%" }]);
});

test("groups product template summary details for quick scanning", () => {
  assert.deepEqual(
    getProductTemplateDetailSections({
      categoryRef: {
        name: "Window film",
      },
      defaultWarrantyDurationMonths: 36,
      modelYear: 2026,
      productCount: 50,
      sku: "FILM-CACH-NHIET-O-TO",
      slug: "film-cach-nhiet-o-to",
    }),
    [
      {
        key: "catalog",
        items: [
          { key: "sku", value: "FILM-CACH-NHIET-O-TO" },
          { key: "slug", value: "film-cach-nhiet-o-to" },
          { key: "category", value: "Window film" },
          { key: "modelYear", value: "2026" },
        ],
      },
      {
        key: "warrantyAndProducts",
        items: [
          { key: "defaultWarrantyDuration", value: "36" },
          { key: "products", value: "50" },
        ],
      },
    ],
  );
});

test("accepts warranty durations above 120 months", () => {
  assert.equal(
    productTemplateFormSchema.safeParse({
      ...formValues,
      defaultWarrantyDurationMonths: 180,
    }).success,
    true,
  );
  assert.equal(
    productTemplateFormSchema.safeParse({
      ...formValues,
      defaultWarrantyDurationMonths: 0,
    }).success,
    false,
  );
});

test("allows a blank template warranty duration", () => {
  const parsed = productTemplateFormSchema.safeParse({
    ...formValues,
    defaultWarrantyDurationMonths: "",
  });

  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal(parsed.data.defaultWarrantyDurationMonths, null);
  assert.equal(
    toCreateTemplateBody(parsed.data).defaultWarrantyDurationMonths,
    null,
  );
});
