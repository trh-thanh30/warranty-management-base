import assert from "node:assert/strict";
import test from "node:test";
import { createAssetsService } from "./create-assets.service.ts";
import type { AssetsHttpClient } from "./assets.types.ts";

test("loading storage usage calls the admin storage endpoint", async () => {
  const calls: unknown[] = [];
  const usage = {
    alertLevel: "NORMAL",
    buckets: {
      private: { bytes: 0, objects: 0 },
      public: { bytes: 0, objects: 0 },
      temp: { bytes: 0, objects: 0 },
    },
    capacityBytes: null,
    certificates: {
      averageBytes: 0,
      bytes: 0,
      objects: 0,
      orphanedBytes: 0,
      orphanedObjects: 0,
    },
    totalBytes: 0,
    totalObjects: 0,
    usagePercent: null,
  };
  const http = {
    async get(url: string) {
      calls.push({ url });
      return { data: { success: true, data: usage } };
    },
  };

  const result = await createAssetsService(
    http as unknown as AssetsHttpClient,
  ).getStorageUsage();

  assert.deepEqual(calls, [{ url: "/assets/storage-usage" }]);
  assert.deepEqual(result, usage);
});

test("deleting an uploaded asset calls the asset delete endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async delete(url: string) {
      calls.push({ url });
      return { data: { success: true, data: undefined } };
    },
  };

  await createAssetsService(http as unknown as AssetsHttpClient).deleteAsset(
    "asset-id",
  );

  assert.deepEqual(calls, [{ url: "/assets/asset-id" }]);
});

test("listing website thumbnails filters public thumbnail assets", async () => {
  const calls: unknown[] = [];
  const response = {
    data: [],
    pagination: { limit: 50, page: 1, total: 0, totalPages: 0 },
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ config, url });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createAssetsService(
    http as unknown as AssetsHttpClient,
  ).listThumbnails();

  assert.deepEqual(result, response);
  assert.deepEqual(calls, [
    {
      config: {
        params: {
          accessType: "PUBLIC",
          folder: "website-thumbnails",
          limit: 50,
          page: 1,
          type: "THUMBNAIL",
        },
      },
      url: "/assets",
    },
  ]);
});

test("deleting an uploaded asset by URL calls the URL cleanup endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async delete(url: string, config?: unknown) {
      calls.push({ config, url });
      return { data: { success: true, data: undefined } };
    },
  };

  await createAssetsService(
    http as unknown as AssetsHttpClient,
  ).deleteAssetByUrl("https://cdn.example.com/categories/image.jpg");

  assert.deepEqual(calls, [
    {
      config: {
        params: {
          url: "https://cdn.example.com/categories/image.jpg",
        },
      },
      url: "/assets/by-url",
    },
  ]);
});

test("uploading a public asset preserves the storage URL returned by the API", async () => {
  const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:4100/api/v1";
  const minioUrl =
    "http://localhost:19000/warranty-management-base-public/2026/07/product-templates/image.png";
  const asset = {
    access_type: "PUBLIC" as const,
    created_at: "2026-07-25T00:00:00.000Z",
    filename: "image.png",
    folder: "product-templates",
    id: "asset-id",
    is_deleted: false,
    metadata: {},
    mime_type: "image/png",
    original_name: "image.png",
    path: "public/2026/07/product-templates/image.png",
    size: 1024,
    type: "IMAGE" as const,
    updated_at: "2026-07-25T00:00:00.000Z",
    uploaded_by_id: "user-id",
    url: minioUrl,
  };
  const http = {
    async post() {
      return { data: { success: true, data: asset } };
    },
  };

  try {
    const result = await createAssetsService(
      http as unknown as AssetsHttpClient,
    ).uploadAsset(new File(["image"], "image.png", { type: "image/png" }));

    assert.equal(result.url, minioUrl);
  } finally {
    if (previousApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
    }
  }
});
