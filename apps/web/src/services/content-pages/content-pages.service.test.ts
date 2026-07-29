import assert from "node:assert/strict";
import test from "node:test";
import type { ContentPageSummary, HttpClient } from "@repo/shared";
import { ContentPagesService } from "./content-pages.service.ts";

const page: ContentPageSummary = {
  categoryId: null,
  categoryRef: null,
  content: "Published content",
  createdAt: "2026-07-29T00:00:00.000Z",
  faqItems: [],
  id: "page-1",
  kind: "GENERAL_POLICY",
  publishedAt: "2026-07-29T00:00:00.000Z",
  slug: "chinh-sach",
  status: "PUBLISHED",
  summary: "Published summary",
  title: "Chính sách",
  updatedAt: "2026-07-29T00:00:00.000Z",
};

test("loads a published content page through the injected HTTP client", async () => {
  const calls: Array<{ config?: unknown; url: string }> = [];
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string, config?: unknown): Promise<T> {
      calls.push({ config, url });
      return { success: true, data: page } as T;
    },
  };
  const service = new ContentPagesService(http);

  const result = await service.getPublishedContentPage("chính sách");

  assert.equal(result, page);
  assert.deepEqual(calls, [
    {
      config: undefined,
      url: "/public/content-pages/ch%C3%ADnh%20s%C3%A1ch",
    },
  ]);
});

test("loads published content pages with the public listing query", async () => {
  const calls: Array<{ config?: unknown; url: string }> = [];
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string, config?: unknown): Promise<T> {
      calls.push({ config, url });
      return {
        success: true,
        data: {
          items: [page],
          meta: {
            page: 1,
            limit: 100,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      } as T;
    },
  };
  const service = new ContentPagesService(http);

  const result = await service.listPublishedContentPages();

  assert.deepEqual(result, [page]);
  assert.deepEqual(calls, [
    {
      url: "/public/content-pages",
      config: {
        params: {
          limit: 100,
          sortBy: "title",
          sortOrder: "asc",
        },
      },
    },
  ]);
});
