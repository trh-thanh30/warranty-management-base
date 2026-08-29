import assert from "node:assert/strict";
import test from "node:test";
import { createProductsService } from "./create-products.service.ts";
import type { ProductsHttpClient } from "./products.types.ts";

const product = {
  id: "product-id",
  productCode: "PRD-000001",
  warrantyCode: "WM-2026-ABCDEF",
  serialNumber: "SN-001",
  displayName: "SUV Battery",
  name: "SUV Battery",
  categoryId: "category-id",
  categoryRef: { id: "category-id", name: "Spare parts" },
  brand: "Demo",
  model: "Battery",
  modelYear: 2026,
  description: null,
  status: "ACTIVE",
  metadata: null,
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
  deletedAt: null,
  owner: null,
  warranty: null,
};

test("activation product options use the dedicated paginated endpoint", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [
      {
        ...product,
        activationEligibility: {
          eligible: false,
          reason: "ACTIVATION_REQUEST_PENDING",
          requestCode: "WAR-20260827-0001",
        },
      },
    ],
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
  ).listActivationProductOptions({
    categoryId: "category-id",
    limit: 20,
    page: 1,
    search: "film",
  });

  assert.deepEqual(calls, [
    {
      url: "/products/activation-options",
      config: {
        params: {
          categoryId: "category-id",
          limit: 20,
          page: 1,
          search: "film",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

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

test("creating a product sends inventory fields", async () => {
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
    name: "SUV Battery",
    categoryId: "category-id",
    displayName: "SUV Battery",
    warrantyDurationMonths: 36,
  });

  assert.deepEqual(calls, [
    {
      url: "/products",
      body: {
        name: "SUV Battery",
        categoryId: "category-id",
        displayName: "SUV Battery",
        warrantyDurationMonths: 36,
      },
    },
  ]);
  assert.deepEqual(result, product);
});

test("updating a product can change dynamic category", async () => {
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
    categoryId: "category-id",
  });

  assert.deepEqual(calls, [
    {
      url: "/products/product-id",
      body: {
        categoryId: "category-id",
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
    autoGenerateWarrantyCode: false,
    customerId: "customer-id",
    purchaseDate: "2026-07-12",
    warrantyCode: "WM-2026-MANUAL1",
  });

  assert.deepEqual(calls, [
    {
      url: "/products/product-id/assign-owner",
      body: {
        autoGenerateWarrantyCode: false,
        customerId: "customer-id",
        purchaseDate: "2026-07-12",
        warrantyCode: "WM-2026-MANUAL1",
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

test("downloading product template requests a blob", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["template"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).downloadImportTemplate();

  assert.deepEqual(calls, [
    {
      url: "/products/import-template",
      config: { responseType: "blob" },
    },
  ]);
  assert.equal(result, blob);
});

test("exporting products requests a filtered blob", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["export"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).exportProducts({
    categoryId: "category-id",
    search: "battery",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  assert.deepEqual(calls, [
    {
      url: "/products/export",
      config: {
        params: {
          categoryId: "category-id",
          search: "battery",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        responseType: "blob",
      },
    },
  ]);
  assert.equal(result, blob);
});

test("previewing product import uploads form data", async () => {
  const calls: Array<{ body?: unknown; url: string }> = [];
  const preview = {
    errors: [],
    invalidRows: 0,
    totalRows: 1,
    validRows: 1,
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: preview } };
    },
  };
  const file = new File(["excel"], "products.xlsx");

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).previewImport(file);

  assert.equal(calls[0]?.url, "/products/import/preview");
  assert.ok(calls[0]?.body instanceof FormData);
  assert.deepEqual(result, preview);
});

test("confirming product import posts edited preview rows", async () => {
  const calls: unknown[] = [];
  const response = {
    created: 1,
    deactivated: 0,
    errors: [],
    updated: 0,
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createProductsService(
    http as unknown as ProductsHttpClient,
  ).confirmImport({
    mode: "upsert",
    rows: [
      {
        displayName: "SUV Battery",
        productName: "Battery Plus",
        categoryCode: "ACCESSORY",
        brand: "Lexzenz",
        model: "Battery Plus",
        modelYear: 2026,
        warrantyDurationMonths: 36,
        warrantyTerms: null,
        installationPosition: "Khoang động cơ",
        productCode: null,
        warrantyCode: null,
        serialNumber: "SN-001",
        status: "ACTIVE",
      },
    ],
  });

  assert.deepEqual(calls, [
    {
      url: "/products/import/confirm",
      body: {
        mode: "upsert",
        rows: [
          {
            displayName: "SUV Battery",
            productName: "Battery Plus",
            categoryCode: "ACCESSORY",
            brand: "Lexzenz",
            model: "Battery Plus",
            modelYear: 2026,
            warrantyDurationMonths: 36,
            warrantyTerms: null,
            installationPosition: "Khoang động cơ",
            productCode: null,
            warrantyCode: null,
            serialNumber: "SN-001",
            status: "ACTIVE",
          },
        ],
      },
    },
  ]);
  assert.deepEqual(result, response);
});
