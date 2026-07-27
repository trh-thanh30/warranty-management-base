import assert from "node:assert/strict";
import test from "node:test";
import { createProductTemplatesService } from "./create-product-templates.service.ts";
import type { ProductTemplatesHttpClient } from "./product-templates.types.ts";

const template = { id: "template-id", name: "PPF X10" };

test("product template service maps CRUD endpoints", async () => {
  const calls: unknown[] = [];
  const response = { data: { success: true, data: template } };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ method: "get", url, config });
      return response;
    },
    async post(url: string, body?: unknown) {
      calls.push({ method: "post", url, body });
      return response;
    },
    async patch(url: string, body?: unknown) {
      calls.push({ method: "patch", url, body });
      return response;
    },
    async delete(url: string) {
      calls.push({ method: "delete", url });
      return response;
    },
  };
  const service = createProductTemplatesService(
    http as unknown as ProductTemplatesHttpClient,
  );

  await service.list({ isPublished: true, page: 1, search: "PPF" });
  await service.detail("template-id");
  await service.create({
    name: "PPF X10",
    categoryId: "category-id",
  });
  await service.update("template-id", { model: "X10 Pro" });
  await service.deactivate("template-id");

  assert.deepEqual(calls, [
    {
      method: "get",
      url: "/product-templates",
      config: { params: { isPublished: true, page: 1, search: "PPF" } },
    },
    {
      method: "get",
      url: "/product-templates/template-id",
      config: undefined,
    },
    {
      method: "post",
      url: "/product-templates",
      body: {
        name: "PPF X10",
        categoryId: "category-id",
      },
    },
    {
      method: "patch",
      url: "/product-templates/template-id",
      body: { model: "X10 Pro" },
    },
    {
      method: "delete",
      url: "/product-templates/template-id",
    },
  ]);
});
