import assert from "node:assert/strict";
import test from "node:test";
import {
  CATEGORY_TYPES,
  MANAGEABLE_CATEGORY_TYPES,
} from "./categories.constants.ts";

test("admin only exposes category types backed by current workflows", () => {
  assert.deepEqual(MANAGEABLE_CATEGORY_TYPES, ["PRODUCT", "CONTENT_PAGE"]);
  assert.deepEqual(CATEGORY_TYPES, [
    "PRODUCT",
    "CONTENT_PAGE",
    "ASSET",
    "WARRANTY_CLAIM_ISSUE",
  ]);
});
