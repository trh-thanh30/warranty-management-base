type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

type RequestConfig = {
  params?: Record<string, unknown>;
};

export type AssetResponse = {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  access_type: "PUBLIC" | "PRIVATE" | "TEMP";
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER";
  folder: string | null;
  metadata: Record<string, unknown> | null;
  is_deleted: boolean;
  uploaded_by_id: string | null;
  created_at: string;
  updated_at: string;
  url: string;
};

export type UploadAssetOptions = {
  accessType?: "PUBLIC" | "PRIVATE" | "TEMP";
  folder?: string;
  type?: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER";
};

export type AssetsHttpClient = {
  delete<T>(url: string): Promise<HttpResponse<T>>;
  post<T>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

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
