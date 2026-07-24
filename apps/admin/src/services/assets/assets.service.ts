import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createAssetsService } from "./create-assets.service";
import type { AssetsHttpClient } from "./assets.types";

export type { AssetResponse, UploadAssetOptions } from "./assets.types";
export type { StorageUsageSummary } from "@repo/shared";

export const assetsService = createAssetsService(
  adminHttpClient as unknown as AssetsHttpClient,
);
