import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveProductCategoryId,
  toCreateProductBody,
  toProductActiveStatus,
  toUpdateProductBody,
} from "./products.utils.ts";
import {
  assignProductOwnerSchema,
  productFormSchema,
} from "./products.types.ts";

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
    }).productCode,
    "CUSTOM-001",
  );
});

test("updates only physical product fields and preserves unrelated metadata", () => {
  assert.deepEqual(
    toUpdateProductBody(
      {
        categoryId: "overridden-category-id",
        displayName: " ",
        installationPosition: " Cửa trước ",
        productCode: "",
        serialNumber: "",
        status: "INACTIVE",
        templateId: "template-id",
        warrantyCode: " wm-2026-new001 ",
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
      serialNumber: null,
      status: "INACTIVE",
      warrantyCode: "wm-2026-new001",
    },
  );
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
