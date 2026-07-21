import assert from "node:assert/strict";
import test from "node:test";
import { createAssetsService } from "./create-assets.service.ts";
import type { AssetsHttpClient } from "./assets.types.ts";

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
