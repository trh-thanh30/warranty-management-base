import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductPhysicalMetadata,
  toCreateProductBody,
  toProductActiveStatus,
  toUpdateProductBody,
} from "./products.utils.ts";
import { productEditFormSchema, productFormSchema } from "./products.types.ts";

test("maps the edit status toggle to an active product status", () => {
  assert.equal(toProductActiveStatus(true), "ACTIVE");
  assert.equal(toProductActiveStatus(false), "INACTIVE");
});

test("separates physical metadata from catalogue metadata in a product response", () => {
  assert.deepEqual(
    getProductPhysicalMetadata({
      applications: ["Windshield"],
      features: ["Heat rejection"],
      installationPosition: "Front-left",
      shortDescription: "Catalogue copy",
      source: "import",
      specifications: [{ key: "UV", value: "99%" }],
    }),
    { installationPosition: "Front-left", source: "import" },
  );
});

test("creates an inventory-only product payload", () => {
  assert.deepEqual(
    toCreateProductBody({
      categoryId: "category-id",
      displayName: "Toyota Camry",
      brand: "Toyota",
      model: "Camry",
      modelYear: 2026,
      description: "",
      coverAssetId: "",
      coverImageUrl: "",
      galleryImages: [],
      features: [{ value: " Cản tia cực tím " }],
      applications: [{ value: " Kính lái ô tô " }],
      specifications: [{ key: " Công suất ", value: " 75W " }],
      installationPosition: " Kính lái ",
      productCode: "",
      status: "ACTIVE",
      warrantyDurationMonths: 180,
      warrantyTerms: "",
    }),
    {
      categoryId: "category-id",
      name: "Toyota Camry",
      displayName: "Toyota Camry",
      brand: "Toyota",
      model: "Camry",
      modelYear: 2026,
      catalogueMetadata: {
        applications: ["Kính lái ô tô"],
        features: ["Cản tia cực tím"],
        specifications: [{ key: "Công suất", value: "75W" }],
      },
      metadata: {
        installationPosition: "Kính lái",
      },
      status: "ACTIVE",
      warrantyDurationMonths: 180,
    },
  );
});

test("sends an explicitly entered product code", () => {
  assert.equal(
    toCreateProductBody({
      categoryId: "category-id",
      displayName: "Camera",
      brand: "",
      model: "",
      description: "",
      coverAssetId: "",
      coverImageUrl: "",
      galleryImages: [],
      features: [],
      applications: [],
      specifications: [],
      installationPosition: "",
      productCode: " CUSTOM-001 ",
      status: "ACTIVE",
      warrantyDurationMonths: 24,
      warrantyTerms: "",
    }).productCode,
    "CUSTOM-001",
  );
});

test("updates only physical product fields and preserves unrelated metadata", () => {
  assert.deepEqual(
    toUpdateProductBody(
      {
        categoryId: "overridden-category-id",
        displayName: "Camera updated",
        brand: "Acme",
        model: "C4K",
        modelYear: 2026,
        description: "Updated",
        coverAssetId: "cover-asset-id",
        coverImageUrl: "https://example.com/cover.jpg",
        galleryImages: [
          {
            assetId: "gallery-asset-id",
            url: "https://example.com/gallery.jpg",
          },
        ],
        features: [{ value: " Heat rejection " }],
        applications: [{ value: " Windshield " }],
        specifications: [{ key: " UV ", value: " 99% " }],
        installationPosition: " Cửa trước ",
        productCode: " PRD-EDIT-001 ",
        status: "INACTIVE",
        warrantyDurationMonths: 60,
        warrantyTerms: "Product terms",
      },
      { source: "import", installationPosition: "Old" },
      { shortDescription: "Preserved" },
    ),
    {
      categoryId: "overridden-category-id",
      name: "Camera updated",
      displayName: "Camera updated",
      brand: "Acme",
      model: "C4K",
      modelYear: 2026,
      description: "Updated",
      catalogueMetadata: {
        applications: ["Windshield"],
        features: ["Heat rejection"],
        shortDescription: "Preserved",
        specifications: [{ key: "UV", value: "99%" }],
      },
      coverAssetId: "cover-asset-id",
      galleryAssetIds: ["gallery-asset-id"],
      metadata: {
        source: "import",
        installationPosition: "Cửa trước",
      },
      productCode: "PRD-EDIT-001",
      status: "INACTIVE",
      warrantyDurationMonths: 60,
      warrantyTerms: "Product terms",
    },
  );
});

test("requires a product code only when editing", () => {
  const values = {
    categoryId: "category-id",
    brand: "",
    model: "",
    description: "",
    coverAssetId: "",
    coverImageUrl: "",
    galleryImages: [],
    features: [],
    applications: [],
    specifications: [],
    displayName: "Camera",
    installationPosition: "",
    productCode: "",
    status: "ACTIVE" as const,
    warrantyTerms: "",
    warrantyDurationMonths: 24,
  };

  assert.equal(productFormSchema.safeParse(values).success, true);
  assert.equal(productEditFormSchema.safeParse(values).success, false);
});

test("requires an individual warranty duration of at least one month", () => {
  const values = {
    categoryId: "category-id",
    brand: "",
    model: "",
    description: "",
    coverAssetId: "",
    coverImageUrl: "",
    galleryImages: [],
    features: [],
    applications: [],
    specifications: [],
    displayName: "Camera",
    installationPosition: "",
    productCode: "",
    status: "ACTIVE" as const,
    warrantyTerms: "",
  };
  const blankDuration = productFormSchema.safeParse({
    ...values,
    warrantyDurationMonths: "",
  });

  assert.equal(blankDuration.success, false);
  if (!blankDuration.success) {
    assert.equal(
      blankDuration.error.issues.find(
        (issue) => issue.path[0] === "warrantyDurationMonths",
      )?.message,
      "durationMonthsRange",
    );
  }
  assert.equal(
    productFormSchema.safeParse({
      ...values,
      warrantyDurationMonths: 180,
    }).success,
    true,
  );
});
