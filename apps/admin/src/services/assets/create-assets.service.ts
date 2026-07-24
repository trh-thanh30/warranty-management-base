import { unwrap } from "../service.utils.ts";
import type { StorageUsageSummary } from "@repo/shared";
import type {
  AssetResponse,
  AssetsHttpClient,
  UploadAssetOptions,
} from "./assets.types";

export function createAssetsService(http: AssetsHttpClient) {
  return {
    async getStorageUsage(): Promise<StorageUsageSummary> {
      return unwrap(
        await http.get<StorageUsageSummary>("/assets/storage-usage"),
      );
    },

    async deleteAsset(assetId: string): Promise<void> {
      await http.delete<void>(`/assets/${assetId}`);
    },

    async deleteAssetByUrl(url: string): Promise<void> {
      await http.delete<void>("/assets/by-url", {
        params: { url },
      });
    },

    async uploadAsset(
      file: File,
      options: UploadAssetOptions = {},
    ): Promise<AssetResponse> {
      const formData = new FormData();
      formData.append("file", file);

      return unwrap(
        await http.post<AssetResponse>("/assets/upload", formData, {
          params: options,
        }),
      );
    },
  };
}
