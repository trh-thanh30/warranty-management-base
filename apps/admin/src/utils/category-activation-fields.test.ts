import assert from "node:assert/strict";
import test from "node:test";
import type { CategoryResponse } from "@repo/shared";
import {
  getCategoryActivationFields,
  isValidActivationFieldKey,
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

test("category activation field keys match the API contract", () => {
  assert.equal(isValidActivationFieldKey("windshield"), true);
  assert.equal(isValidActivationFieldKey("lamp_position2"), true);
  assert.equal(isValidActivationFieldKey("123"), false);
  assert.equal(isValidActivationFieldKey("_position"), false);
});

test("category activation fields use first-class API configuration", () => {
  assert.deepEqual(
    getCategoryActivationFields({
      ...category,
      activationFormEnabled: true,
      activationFields: [
        {
          key: "rearGlass",
          label: "Kinh lung",
          order: 2,
          type: "PRODUCT_SELECT",
        },
        {
          key: "windshield",
          label: "Kinh lai",
          order: 1,
          type: "PRODUCT_SELECT",
        },
      ],
    }),
    [
      {
        key: "windshield",
        label: "Kinh lai",
        order: 1,
        type: "PRODUCT_SELECT",
      },
      {
        key: "rearGlass",
        label: "Kinh lung",
        order: 2,
        type: "PRODUCT_SELECT",
      },
    ],
  );
});

test("category activation fields do not fall back to hardcoded Film fields", () => {
  assert.deepEqual(
    getCategoryActivationFields({
      ...category,
      activationFormEnabled: true,
      activationFields: [],
      metadata: {
        activationFields: [{ key: "legacy", label: "Legacy", type: "TEXT" }],
      },
    }),
    [],
  );
});

test("disabled first-class configuration hides all activation fields", () => {
  assert.deepEqual(
    getCategoryActivationFields({
      ...category,
      activationFormEnabled: false,
      activationFields: [
        { key: "windshield", label: "Kinh lai", type: "PRODUCT_SELECT" },
      ],
    }),
    [],
  );
});
