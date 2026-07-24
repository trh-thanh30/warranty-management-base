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
