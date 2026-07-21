import assert from "node:assert/strict";
import test from "node:test";
import { createCategoriesService } from "./create-categories.service.ts";
import type { CategoriesHttpClient } from "./categories.types.ts";

const category = {
  id: "category-id",
  type: "PRODUCT",
  code: "SUV",
  slug: "suv",
  name: "SUV",
  description: null,
  parentId: null,
  icon: "car",
  imageUrl: null,
  order: 10,
  isActive: true,
  metadata: { segment: "vehicle" },
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};

test("category directory requests paginated categories with filters", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [category],
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

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).listCategories({
    isActive: "true",
    page: 1,
    search: "suv",
    type: "PRODUCT",
  });

  assert.deepEqual(calls, [
    {
      url: "/categories",
      config: {
        params: {
          isActive: "true",
          page: 1,
          search: "suv",
          type: "PRODUCT",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("creating a category sends taxonomy fields", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: category } };
    },
  };

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).createCategory({
    code: "SUV",
    metadata: { segment: "vehicle" },
    name: "SUV",
    order: 10,
    slug: "suv",
    type: "PRODUCT",
  });

  assert.deepEqual(calls, [
    {
      url: "/categories",
      body: {
        code: "SUV",
        metadata: { segment: "vehicle" },
        name: "SUV",
        order: 10,
        slug: "suv",
        type: "PRODUCT",
      },
    },
  ]);
  assert.deepEqual(result, category);
});

test("updating a category can clear the parent", async () => {
  const calls: unknown[] = [];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: category } };
    },
  };

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).updateCategory("category-id", {
    parentId: null,
  });

  assert.deepEqual(calls, [
    {
      url: "/categories/category-id",
      body: {
        parentId: null,
      },
    },
  ]);
  assert.deepEqual(result, category);
});

test("deactivating a category uses the delete endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async delete(url: string) {
      calls.push({ url });
      return {
        data: { success: true, data: { ...category, isActive: false } },
      };
    },
  };

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).deactivateCategory("category-id");

  assert.deepEqual(calls, [{ url: "/categories/category-id" }]);
  assert.equal(result.isActive, false);
});

test("reordering categories sends the reorder body", async () => {
  const calls: unknown[] = [];
  const response = [{ ...category, order: 20 }];
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).reorderCategories({
    parentId: null,
    items: [{ id: "category-id", order: 20 }],
  });

  assert.deepEqual(calls, [
    {
      url: "/categories/reorder",
      body: {
        parentId: null,
        items: [{ id: "category-id", order: 20 }],
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("downloading the category template requests a blob", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["template"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).downloadImportTemplate();

  assert.equal(result, blob);
  assert.deepEqual(calls, [
    {
      url: "/categories/import-template",
      config: { responseType: "blob" },
    },
  ]);
});

test("exporting categories forwards the current filters", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["export"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).exportCategories({
    isActive: "true",
    search: "suv",
    sortBy: "order",
    sortOrder: "asc",
    type: "PRODUCT",
  });

  assert.deepEqual(calls, [
    {
      url: "/categories/export",
      config: {
        params: {
          isActive: "true",
          search: "suv",
          sortBy: "order",
          sortOrder: "asc",
          type: "PRODUCT",
        },
        responseType: "blob",
      },
    },
  ]);
});

test("importing categories sends the Excel file as form data", async () => {
  let request: { url: string; body: unknown } | undefined;
  const response = { created: 1, updated: 0, errors: [] };
  const http = {
    async post(url: string, body?: unknown) {
      request = { url, body };
      return { data: { success: true, data: response } };
    },
  };
  const file = new File(["excel"], "categories.xlsx");

  const result = await createCategoriesService(
    http as unknown as CategoriesHttpClient,
  ).importCategories(file);

  assert.deepEqual(result, response);
  assert.equal(request?.url, "/categories/import");
  assert.ok(request?.body instanceof FormData);
  assert.equal((request?.body as FormData).get("file"), file);
});
