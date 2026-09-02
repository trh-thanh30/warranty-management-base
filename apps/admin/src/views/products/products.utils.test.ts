import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  getInitials,
  getProductWarrantyProgress,
  getProductPhysicalMetadata,
  getProductSaveErrorMatch,
  toCreateProductBody,
  toProductActiveStatus,
  toUpdateProductBody,
} from "./products.utils.ts";
import {
  assignProductOwnerSchema,
  productEditFormSchema,
  productFormSchema,
} from "./products.types.ts";

test("gets initials from the last two parts of a product owner name", () => {
  assert.equal(getInitials("Nguyễn Văn Hùng"), "VH");
  assert.equal(getInitials("  Lê   Minh  "), "LM");
});

test("calculates active warranty progress and remaining months", () => {
  assert.deepEqual(
    getProductWarrantyProgress(
      {
        endDate: "2028-01-01T00:00:00.000Z",
        startDate: "2026-01-01T00:00:00.000Z",
      },
      new Date("2026-03-01T00:00:00.000Z"),
    ),
    {
      percentage: 8,
      remainingMonths: 22,
      state: "active",
    },
  );
});

test("clamps warranty progress before activation and after expiry", () => {
  const warranty = {
    endDate: "2027-01-01T00:00:00.000Z",
    startDate: "2026-01-01T00:00:00.000Z",
  };

  assert.deepEqual(
    getProductWarrantyProgress(warranty, new Date("2025-12-01T00:00:00.000Z")),
    {
      percentage: 0,
      remainingMonths: 13,
      state: "upcoming",
    },
  );
  assert.deepEqual(
    getProductWarrantyProgress(warranty, new Date("2027-02-01T00:00:00.000Z")),
    {
      percentage: 100,
      remainingMonths: 0,
      state: "expired",
    },
  );
});

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
      serialNumber: " VIN-001 ",
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
      serialNumber: "VIN-001",
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
      serialNumber: "",
      status: "ACTIVE",
      warrantyDurationMonths: 24,
      warrantyTerms: "",
    }).productCode,
    "CUSTOM-001",
  );
});

test("sends an explicitly entered warranty code when creating a product", () => {
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
      productCode: "",
      serialNumber: "",
      status: "ACTIVE",
      warrantyDurationMonths: 24,
      warrantyTerms: "",
      warrantyCode: " wm-2026-manual1 ",
    }).warrantyCode,
    "WM-2026-MANUAL1",
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
        serialNumber: "",
        status: "INACTIVE",
        warrantyCode: " wm-2026-new001 ",
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
      serialNumber: null,
      status: "INACTIVE",
      warrantyCode: "wm-2026-new001",
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
    serialNumber: "",
    status: "ACTIVE" as const,
    warrantyTerms: "",
    warrantyDurationMonths: 24,
  };

  assert.equal(productFormSchema.safeParse(values).success, true);
  assert.equal(productEditFormSchema.safeParse(values).success, false);
});

test("allows a blank warranty code but rejects an invalid non-empty code", () => {
  const baseValues = {
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
    serialNumber: "",
    status: "ACTIVE" as const,
    warrantyDurationMonths: 24,
    warrantyTerms: "",
  };

  assert.equal(
    productFormSchema.safeParse({
      ...baseValues,
      warrantyCode: "",
    }).success,
    true,
  );
  assert.equal(
    productFormSchema.safeParse({
      ...baseValues,
      warrantyCode: "bad code!",
    }).success,
    false,
  );
  assert.equal(
    productFormSchema.safeParse({
      ...baseValues,
      warrantyCode: "wm-2026-new001",
    }).success,
    true,
  );
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
    serialNumber: "",
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

test("maps stable warranty duration detail codes to the duration field", () => {
  const error = new HttpClientError({
    code: "BAD_REQUEST",
    details: { code: "WARRANTY_DURATION_NOT_DRAFT" },
    isNetworkError: false,
    message: "Backend wording may change",
    status: 400,
  });

  assert.deepEqual(getProductSaveErrorMatch(error), [
    "warrantyDurationMonths",
    "warrantyDurationNotDraft",
  ]);
});

test("requires a valid manual warranty code when auto generation is disabled", () => {
  assert.equal(
    assignProductOwnerSchema.safeParse({
      autoGenerateWarrantyCode: false,
      customerId: "customer-id",
      purchaseDate: "",
      warrantyCode: "",
    }).success,
    false,
  );
  assert.equal(
    assignProductOwnerSchema.safeParse({
      autoGenerateWarrantyCode: false,
      customerId: "customer-id",
      purchaseDate: "",
      warrantyCode: "wm-2026-manual1",
    }).success,
    true,
  );
});
