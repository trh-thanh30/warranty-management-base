import assert from "node:assert/strict";
import test from "node:test";
import {
  createAssetsService,
  type AssetsHttpClient,
} from "./create-assets.service.ts";

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
