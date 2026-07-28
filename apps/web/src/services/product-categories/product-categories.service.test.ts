import assert from "node:assert/strict";
import test from "node:test";
import type { HttpClient } from "@repo/shared";
import { ProductCategoriesService } from "./product-categories.service.ts";

test("loads public product categories through the injected HTTP client", async () => {
  const calls: string[] = [];
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string, config?: unknown) {
      calls.push(JSON.stringify({ url, config }));
      return {
        success: true,
        data: {
          items: [
            {
              id: "category-1",
              slug: "film",
              name: "Film",
              description: null,
              parentId: null,
              icon: null,
              imageUrl: "https://cdn.example.com/film.jpg",
              order: 10,
              productCount: 3,
            },
          ],
          meta: {
            page: 1,
            limit: 4,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      } as T;
    },
  };
  const service = new ProductCategoriesService(http);

  const result = await service.listProductCategories({
    page: 1,
    limit: 4,
    hasImage: true,
  });

  assert.deepEqual(calls, [
    JSON.stringify({
      url: "/public/product-categories",
      config: {
        params: {
          page: 1,
          limit: 4,
          hasImage: true,
        },
      },
    }),
  ]);
  assert.equal(result.items[0]?.slug, "film");
});

test("propagates HTTP errors for the view orchestration to handle", async () => {
  const http: Pick<HttpClient, "get"> = {
    async get<T>(): Promise<T> {
      throw new Error("API unavailable");
    },
  };
  const service = new ProductCategoriesService(http);

  await assert.rejects(
    service.listProductCategories({ page: 1, limit: 4 }),
    /API unavailable/,
  );
});
