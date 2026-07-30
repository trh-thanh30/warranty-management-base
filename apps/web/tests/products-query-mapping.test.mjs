import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_PRODUCT_CATEGORIES,
  buildPublicProductsQuery,
} from "../src/views/products/products.utils.ts";

test("newest products query trims search and omits the all category filter", () => {
  assert.deepEqual(
    buildPublicProductsQuery({
      page: 3,
      limit: 6,
      search: " camera ",
      categoryId: ALL_PRODUCT_CATEGORIES,
      sort: "newest",
    }),
    {
      page: 3,
      limit: 6,
      search: "camera",
      sortBy: "publishedAt",
      sortOrder: "desc",
    },
  );
});

test("name sorting maps to the public API contract", () => {
  assert.deepEqual(
    buildPublicProductsQuery({
      page: 1,
      limit: 6,
      search: "",
      categoryId: "f82754bf-333e-4d8a-8efb-7f17baf3fbba",
      sort: "name-desc",
    }),
    {
      page: 1,
      limit: 6,
      categoryId: "f82754bf-333e-4d8a-8efb-7f17baf3fbba",
      sortBy: "name",
      sortOrder: "desc",
    },
  );
});
