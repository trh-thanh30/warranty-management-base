import assert from "node:assert/strict";
import test from "node:test";
import {
  createProductsService,
  type ProductsHttpClient,
} from "./create-products.service.ts";

const product = {
  id: "product-id",
  productCode: "PRD-000001",
  warrantyCode: "WM-2026-ABCDEF",
  serialNumber: "SN-001",
  name: "SUV Battery",
  category: "SPARE_PART",
  categoryId: "category-id",
  categoryRef: null,
  brand: "Demo",
  model: "Battery",
  manufactureYear: 2026,
  description: null,
  status: "ACTIVE",
  metadata: null,
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
  deletedAt: null,
  owner: null,
  warranty: null,
};

test("product directory requests paginated products with filters", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [product],
    meta: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).listProducts({
    category: "SPARE_PART",
    categoryId: "category-id",
    page: 1,
    search: "battery",
    status: "ACTIVE",
    warrantyStatus: "ACTIVE",
  });

  assert.deepEqual(calls, [
    {
      url: "/products",
      config: {
        params: {
          category: "SPARE_PART",
          categoryId: "category-id",
          page: 1,
          search: "battery",
          status: "ACTIVE",
          warrantyStatus: "ACTIVE",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("creating a product sends warranty and category fields", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: product } };
    },
  };

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).createProduct({
    autoGenerateWarrantyCode: false,
    category: "SPARE_PART",
    categoryId: "category-id",
    name: "SUV Battery",
    warrantyCode: "WM-2026-ABCDEF",
  });

  assert.deepEqual(calls, [
    {
      url: "/products",
      body: {
        autoGenerateWarrantyCode: false,
        category: "SPARE_PART",
        categoryId: "category-id",
        name: "SUV Battery",
        warrantyCode: "WM-2026-ABCDEF",
      },
    },
  ]);
  assert.deepEqual(result, product);
});

test("updating a product can clear dynamic category", async () => {
  const calls: unknown[] = [];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: product } };
    },
  };

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).updateProduct("product-id", {
    categoryId: null,
  });

  assert.deepEqual(calls, [
    {
      url: "/products/product-id",
      body: {
        categoryId: null,
      },
    },
  ]);
  assert.deepEqual(result, product);
});

test("assigning an owner posts to product assign-owner endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: product } };
    },
  };

  await createProductsService(
    http as unknown as ProductsHttpClient,
  ).assignOwner("product-id", {
    customerId: "customer-id",
    purchaseDate: "2026-07-12",
  });

  assert.deepEqual(calls, [
    {
      url: "/products/product-id/assign-owner",
      body: {
        customerId: "customer-id",
        purchaseDate: "2026-07-12",
      },
    },
  ]);
});

test("deleting a product uses the delete endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async delete(url: string) {
      calls.push({ url });
      return { data: { success: true, data: product } };
    },
  };

  await createProductsService(
    http as unknown as ProductsHttpClient,
  ).deleteProduct("product-id");

  assert.deepEqual(calls, [{ url: "/products/product-id" }]);
});
