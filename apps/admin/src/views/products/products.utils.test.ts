import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError, type ProductTemplateSummary } from "@repo/shared";
import {
  getProductTemplateSearchKeywords,
  getProductSaveErrorMatch,
  mergeProductTemplateOptions,
  resolveProductCategoryId,
  toCreateProductBody,
  toProductActiveStatus,
  toUpdateProductBody,
} from "./products.utils.ts";
import {
  assignProductOwnerSchema,
  productEditFormSchema,
  productFormSchema,
} from "./products.types.ts";

const currentTemplate = {
  id: "template-current",
  name: "Phim cách nhiệt ô tô",
  sku: "PHIM-CACH-NHIET-O-TO",
  brand: "Lexzenz",
  model: "Reflex",
  categoryRef: {
    name: "Film cách nhiệt ô tô Lexzenz Reflex Korea Film",
    code: "LEXZENZ_REFLEX_KOREA_FILM",
    slug: "film-cach-nhiet-o-to-lexzenz-reflex-korea-film",
  },
} as ProductTemplateSummary;

test("builds product template search keywords from template and category data", () => {
  assert.deepEqual(getProductTemplateSearchKeywords(currentTemplate), [
    "Phim cách nhiệt ô tô",
    "PHIM-CACH-NHIET-O-TO",
    "Lexzenz",
    "Reflex",
    "Film cách nhiệt ô tô Lexzenz Reflex Korea Film",
    "LEXZENZ_REFLEX_KOREA_FILM",
    "film-cach-nhiet-o-to-lexzenz-reflex-korea-film",
  ]);
});

test("keeps a selected template outside the current search result exactly once", () => {
  const resultTemplate = {
    ...currentTemplate,
    id: "template-result",
    name: "Film SP50",
  };

  assert.deepEqual(
    mergeProductTemplateOptions([resultTemplate], currentTemplate).map(
      (template) => template.id,
    ),
    ["template-current", "template-result"],
  );
  assert.deepEqual(
    mergeProductTemplateOptions(
      [currentTemplate, resultTemplate],
      currentTemplate,
    ).map((template) => template.id),
    ["template-current", "template-result"],
  );
});

test("maps the edit status toggle to an active product status", () => {
  assert.equal(toProductActiveStatus(true), "ACTIVE");
  assert.equal(toProductActiveStatus(false), "INACTIVE");
});

test("resets category to the new template default after a template change", () => {
  assert.equal(
    resolveProductCategoryId({
      currentCategoryId: "overridden-category",
      templateCategoryId: "new-template-category",
      templateChanged: true,
    }),
    "new-template-category",
  );
});

test("preserves an existing category when the template did not change", () => {
  assert.equal(
    resolveProductCategoryId({
      currentCategoryId: "overridden-category",
      templateCategoryId: "template-category",
      templateChanged: false,
    }),
    "overridden-category",
  );
});

test("creates an inventory-only product payload", () => {
  assert.deepEqual(
    toCreateProductBody({
      categoryId: "category-id",
      displayName: " Toyota Camry - showroom ",
      installationPosition: " Kính lái ",
      productCode: "",
      serialNumber: " VIN-001 ",
      status: "ACTIVE",
      templateId: "template-id",
      warrantyDurationMonths: 180,
    }),
    {
      categoryId: "category-id",
      displayName: "Toyota Camry - showroom",
      metadata: {
        installationPosition: "Kính lái",
      },
      serialNumber: "VIN-001",
      status: "ACTIVE",
      templateId: "template-id",
      warrantyDurationMonths: 180,
    },
  );
});

test("sends an explicitly entered product code", () => {
  assert.equal(
    toCreateProductBody({
      categoryId: "category-id",
      displayName: "",
      installationPosition: "",
      productCode: " CUSTOM-001 ",
      serialNumber: "",
      status: "ACTIVE",
      templateId: "template-id",
      warrantyDurationMonths: 24,
    }).productCode,
    "CUSTOM-001",
  );
});

test("sends an explicitly entered warranty code when creating a product", () => {
  assert.equal(
    toCreateProductBody({
      categoryId: "category-id",
      displayName: "",
      installationPosition: "",
      productCode: "",
      serialNumber: "",
      status: "ACTIVE",
      templateId: "template-id",
      warrantyDurationMonths: 24,
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
        displayName: " ",
        installationPosition: " Cửa trước ",
        productCode: " PRD-EDIT-001 ",
        serialNumber: "",
        status: "INACTIVE",
        templateId: "template-id",
        warrantyCode: " wm-2026-new001 ",
        warrantyDurationMonths: 60,
      },
      { source: "import", installationPosition: "Old" },
    ),
    {
      categoryId: "overridden-category-id",
      displayName: null,
      metadata: {
        source: "import",
        installationPosition: "Cửa trước",
      },
      productCode: "PRD-EDIT-001",
      serialNumber: null,
      status: "INACTIVE",
      templateId: "template-id",
      warrantyCode: "wm-2026-new001",
      warrantyDurationMonths: 60,
    },
  );
});

test("requires a product code only when editing", () => {
  const values = {
    categoryId: "category-id",
    displayName: "",
    installationPosition: "",
    productCode: "",
    serialNumber: "",
    status: "ACTIVE" as const,
    templateId: "template-id",
    warrantyDurationMonths: 24,
  };

  assert.equal(productFormSchema.safeParse(values).success, true);
  assert.equal(productEditFormSchema.safeParse(values).success, false);
});

test("allows a blank warranty code but rejects an invalid non-empty code", () => {
  const baseValues = {
    categoryId: "category-id",
    displayName: "",
    installationPosition: "",
    productCode: "",
    serialNumber: "",
    status: "ACTIVE" as const,
    templateId: "template-id",
    warrantyDurationMonths: 24,
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
    displayName: "",
    installationPosition: "",
    productCode: "",
    serialNumber: "",
    status: "ACTIVE" as const,
    templateId: "template-id",
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
