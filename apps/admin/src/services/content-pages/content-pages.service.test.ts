import assert from "node:assert/strict";
import test from "node:test";
import {
  createContentPagesService,
  type ContentPagesHttpClient,
} from "./create-content-pages.service.ts";

const page = {
  id: "page-1",
  slug: "warranty-policy",
  title: "Warranty policy",
  summary: "Warranty terms",
  content: "<p>Policy content</p>",
  kind: "POLICY",
  status: "DRAFT",
  publishedAt: null,
  createdAt: "2026-07-17T00:00:00.000Z",
  updatedAt: "2026-07-17T00:00:00.000Z",
};

test("lists content pages with directory filters", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [page],
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

  const result = await createContentPagesService(
    http as unknown as ContentPagesHttpClient,
  ).list({ kind: "POLICY", page: 1, search: "policy", status: "DRAFT" });

  assert.deepEqual(calls, [
    {
      url: "/content-pages",
      config: {
        params: { kind: "POLICY", page: 1, search: "policy", status: "DRAFT" },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("gets a content page detail", async () => {
  const calls: string[] = [];
  const http = {
    async get(url: string) {
      calls.push(url);
      return { data: { success: true, data: page } };
    },
  };

  const result = await createContentPagesService(
    http as unknown as ContentPagesHttpClient,
  ).get("page-1");

  assert.deepEqual(calls, ["/content-pages/page-1"]);
  assert.deepEqual(result, page);
});

test("creates and updates content pages", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ method: "post", url, body });
      return { data: { success: true, data: page } };
    },
    async patch(url: string, body?: unknown) {
      calls.push({ method: "patch", url, body });
      return {
        data: { success: true, data: { ...page, status: "PUBLISHED" } },
      };
    },
  };
  const service = createContentPagesService(
    http as unknown as ContentPagesHttpClient,
  );
  const body = {
    slug: page.slug,
    title: page.title,
    content: page.content,
    kind: "POLICY" as const,
    status: "DRAFT" as const,
  };

  await service.create(body);
  await service.update("page-1", { status: "PUBLISHED" });

  assert.deepEqual(calls, [
    { method: "post", url: "/content-pages", body },
    {
      method: "patch",
      url: "/content-pages/page-1",
      body: { status: "PUBLISHED" },
    },
  ]);
});

test("deletes a content page", async () => {
  const calls: string[] = [];
  const http = {
    async delete(url: string) {
      calls.push(url);
      return { data: { success: true, data: undefined } };
    },
  };

  await createContentPagesService(
    http as unknown as ContentPagesHttpClient,
  ).delete("page-1");

  assert.deepEqual(calls, ["/content-pages/page-1"]);
});
