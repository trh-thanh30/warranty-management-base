import assert from "node:assert/strict";
import test from "node:test";
import { ProductCategoriesService } from "../src/services/product-categories/product-categories.service.ts";
import { ProductsService } from "../src/services/products/products.service.ts";

const emptyMeta = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

test("products service sends filters and abort signal to the public endpoint", async () => {
  const calls = [];
  const payload = { items: [], meta: emptyMeta };
  const service = new ProductsService({
    get: async (url, config) => {
      calls.push({ url, config });
      return { data: payload };
    },
  });
  const signal = new AbortController().signal;
  const query = {
    page: 2,
    limit: 6,
    search: "camera",
    categoryId: "f82754bf-333e-4d8a-8efb-7f17baf3fbba",
    sortBy: "name",
    sortOrder: "asc",
  };

  assert.deepEqual(await service.listProducts(query, signal), payload);
  assert.deepEqual(calls, [
    {
      url: "/public/products",
      config: { params: query, signal },
    },
  ]);
});

test("product categories service forwards the abort signal", async () => {
  const calls = [];
  const payload = { items: [], meta: emptyMeta };
  const service = new ProductCategoriesService({
    get: async (url, config) => {
      calls.push({ url, config });
      return { data: payload };
    },
  });
  const signal = new AbortController().signal;
  const query = { page: 1, limit: 100 };

  assert.deepEqual(await service.listProductCategories(query, signal), payload);
  assert.deepEqual(calls, [
    {
      url: "/public/product-categories",
      config: { params: query, signal },
    },
  ]);
});

test("products service loads public detail by encoded slug", async () => {
  const calls = [];
  const payload = {
    id: "template-id",
    slug: "sp 50",
    name: "SP50",
  };
  const service = new ProductsService({
    get: async (url, config) => {
      calls.push({ url, config });
      return { data: payload };
    },
  });
  const signal = new AbortController().signal;

  assert.deepEqual(await service.getProductDetail("sp 50", signal), payload);
  assert.deepEqual(calls, [
    {
      url: "/public/products/sp%2050",
      config: { signal },
    },
  ]);
});
