import assert from "node:assert/strict";
import test from "node:test";
import {
  fromDraftActivationFields,
  toDraftActivationFields,
} from "./category-activation-fields.utils.ts";

test("product selectors never submit manually configured options", () => {
  assert.deepEqual(
    fromDraftActivationFields([
      {
        key: "windshield",
        label: "Kinh lai",
        options: [{ label: "SP50", value: "SP50" }],
        placeholder: "Chon san pham",
        required: true,
        type: "PRODUCT_SELECT",
      },
    ]),
    [
      {
        key: "windshield",
        label: "Kinh lai",
        order: 1,
        placeholder: "Chon san pham",
        required: true,
        type: "PRODUCT_SELECT",
      },
    ],
  );
});

test("empty configuration stays empty instead of injecting Film defaults", () => {
  assert.deepEqual(toDraftActivationFields([]), []);
});
