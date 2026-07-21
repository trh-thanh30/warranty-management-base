import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductSpecifications,
  mergeProductSpecifications,
  resolveSpecificationMove,
  toCreateProductBody,
  toProductActiveStatus,
} from "./products.utils.ts";
import {
  assignProductOwnerSchema,
  productSpecificationsSchema,
} from "./products.types.ts";

test("reads valid product specifications from metadata", () => {
  assert.deepEqual(
    getProductSpecifications({
      source: "admin",
      specifications: {
        "Công nghệ": "Nano Ceramic",
        "Độ truyền sáng": "54,4%",
      },
    }),
    [
      { key: "Công nghệ", value: "Nano Ceramic" },
      { key: "Độ truyền sáng", value: "54,4%" },
    ],
  );
});

test("ignores malformed historical product specifications", () => {
  assert.deepEqual(
    getProductSpecifications({
      specifications: {
        valid: "value",
        nested: { value: "unsupported" },
        missing: null,
      },
    }),
    [{ key: "valid", value: "value" }],
  );
  assert.deepEqual(getProductSpecifications({ specifications: [] }), []);
  assert.deepEqual(getProductSpecifications(null), []);
});

test("reads ordered product specifications from metadata", () => {
  assert.deepEqual(
    getProductSpecifications({
      specifications: [
        { key: "UV rejection", value: "99.9%" },
        { key: "Technology", value: "Nano Ceramic" },
      ],
    }),
    [
      { key: "UV rejection", value: "99.9%" },
      { key: "Technology", value: "Nano Ceramic" },
    ],
  );
});

test("merges trimmed specifications without removing other metadata", () => {
  assert.deepEqual(
    mergeProductSpecifications({ source: "admin", version: 1 }, [
      { key: " Công nghệ ", value: " Nano Ceramic " },
      { key: "Độ truyền sáng", value: "54,4%" },
      { key: "", value: "" },
    ]),
    {
      source: "admin",
      version: 1,
      specifications: [
        { key: "Công nghệ", value: "Nano Ceramic" },
        { key: "Độ truyền sáng", value: "54,4%" },
      ],
    },
  );
});

test("clears only specifications when all rows are empty", () => {
  assert.deepEqual(
    mergeProductSpecifications(
      { source: "admin", specifications: { legacy: "value" } },
      [{ key: "", value: "" }],
    ),
    { source: "admin" },
  );
  assert.equal(
    mergeProductSpecifications({ specifications: { legacy: "value" } }, []),
    null,
  );
});

test("accepts complete and fully empty specification rows", () => {
  assert.equal(
    productSpecificationsSchema.safeParse([
      { key: "Công nghệ", value: "Nano Ceramic" },
      { key: "", value: "" },
    ]).success,
    true,
  );
});

test("rejects partially completed specification rows", () => {
  const result = productSpecificationsSchema.safeParse([
    { key: "Công nghệ", value: "" },
  ]);

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.message, "specificationValueRequired");
  }
});

test("rejects duplicate trimmed specification keys", () => {
  const result = productSpecificationsSchema.safeParse([
    { key: "Công nghệ", value: "Nano Ceramic" },
    { key: " Công nghệ ", value: "SPUTTER" },
  ]);

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.message, "specificationKeyDuplicate");
  }
});

test("maps the edit status toggle to an active product status", () => {
  assert.equal(toProductActiveStatus(true), "ACTIVE");
  assert.equal(toProductActiveStatus(false), "INACTIVE");
});

test("resolves a sortable field move and ignores invalid drops", () => {
  const fields = [{ id: "first" }, { id: "second" }, { id: "third" }];

  assert.deepEqual(resolveSpecificationMove(fields, "third", "first"), {
    from: 2,
    to: 0,
  });
  assert.equal(resolveSpecificationMove(fields, "first", "first"), null);
  assert.equal(resolveSpecificationMove(fields, "missing", "first"), null);
  assert.equal(resolveSpecificationMove(fields, "first", undefined), null);
});

test("creates an inventory-only product payload", () => {
  assert.deepEqual(
    toCreateProductBody({
      brand: " Toyota ",
      category: "CAR",
      categoryId: "",
      coverAssetId: "",
      coverImageUrl: "",
      description: "",
      manufactureYear: 2026,
      model: " Camry ",
      name: " Toyota Camry ",
      serialNumber: " VIN-001 ",
      specifications: [{ key: "Technology", value: "Nano Ceramic" }],
      status: "ACTIVE",
    }),
    {
      brand: "Toyota",
      category: "CAR",
      categoryId: undefined,
      coverAssetId: undefined,
      description: undefined,
      manufactureYear: 2026,
      metadata: {
        specifications: [{ key: "Technology", value: "Nano Ceramic" }],
      },
      model: "Camry",
      name: "Toyota Camry",
      serialNumber: "VIN-001",
      status: "ACTIVE",
    },
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
