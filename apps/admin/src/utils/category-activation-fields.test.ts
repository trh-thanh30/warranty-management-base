import assert from "node:assert/strict";
import test from "node:test";
import type { CategoryResponse } from "@repo/shared";
import {
  DEFAULT_CATEGORY_ACTIVATION_FIELDS,
  buildCategoryMetadataWithActivationFields,
  getCategoryActivationFields,
  isCategoryActivationFormEnabled,
  parseActivationFields,
} from "./category-activation-fields.ts";

const category = {
  id: "category-id",
  type: "PRODUCT",
  code: "CAT",
  slug: "cat",
  name: "Category",
  description: null,
  parentId: null,
  icon: null,
  imageUrl: null,
  order: 0,
  isActive: true,
  metadata: null,
  createdAt: "2026-07-24T00:00:00.000Z",
  updatedAt: "2026-07-24T00:00:00.000Z",
} satisfies CategoryResponse;

test("category activation fields stay hidden until a category is selected", () => {
  assert.deepEqual(getCategoryActivationFields(null), []);
});

test("category activation fields fall back only when category has no config", () => {
  assert.equal(
    getCategoryActivationFields(category)[0]?.key,
    DEFAULT_CATEGORY_ACTIVATION_FIELDS[0]?.key,
  );
  assert.deepEqual(
    getCategoryActivationFields({
      ...category,
      metadata: { activationFields: [] },
    }),
    [],
  );
});

test("category activation fields are hidden when form is disabled", () => {
  const metadata = {
    activationFieldsEnabled: false,
    activationFields: [
      {
        key: "windshield",
        label: "Kinh lai",
        type: "TEXT",
      },
    ],
  };

  assert.equal(isCategoryActivationFormEnabled(metadata), false);
  assert.deepEqual(
    getCategoryActivationFields({
      ...category,
      metadata,
    }),
    [],
  );
});

test("category activation fields metadata keeps enabled flag", () => {
  assert.deepEqual(
    buildCategoryMetadataWithActivationFields(
      { existing: true },
      [
        {
          key: "windshield",
          label: "Kinh lai",
          type: "TEXT",
        },
      ],
      false,
    ),
    {
      existing: true,
      activationFieldsEnabled: false,
      activationFields: [
        {
          key: "windshield",
          label: "Kinh lai",
          order: 1,
          placeholder: undefined,
          required: false,
          type: "TEXT",
          options: undefined,
        },
      ],
    },
  );
});

test("category activation fields ignore invalid metadata rows", () => {
  assert.deepEqual(
    parseActivationFields({
      activationFields: [
        {
          key: "windshield",
          label: "Kinh lai",
          type: "TEXT",
          order: 2,
        },
        {
          key: "",
          label: "",
          type: "TEXT",
        },
      ],
    }),
    [
      {
        key: "windshield",
        label: "Kinh lai",
        order: 2,
        required: false,
        type: "TEXT",
      },
    ],
  );
});
