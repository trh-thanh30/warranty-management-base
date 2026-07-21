import { unwrap } from "../service.utils.ts";
import type {
  AssetResponse,
  AssetsHttpClient,
  UploadAssetOptions,
} from "./assets.types";

function resolvePublicAssetUrl(asset: AssetResponse) {
  if (asset.access_type !== "PUBLIC") return asset.url;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) return asset.url;

  try {
    const apiUrl = new URL(apiBaseUrl);
    const cleanPath = asset.path
      .replace(/\\/g, "/")
      .replace(/^public\//, "")
      .replace(/^\/+/, "");

    return `${apiUrl.origin}/cdn/${cleanPath}`;
  } catch {
    return asset.url;
  }
}

export function createAssetsService(http: AssetsHttpClient) {
  return {
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

      const asset = unwrap(
        await http.post<AssetResponse>("/assets/upload", formData, {
          params: options,
        }),
      );

      return {
        ...asset,
        url: resolvePublicAssetUrl(asset),
      };
    },
  };
}
