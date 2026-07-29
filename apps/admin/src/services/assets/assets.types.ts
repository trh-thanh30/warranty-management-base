import type { HttpDelete, HttpGet, HttpWrite } from "../service.types";

export type AssetResponse = {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  access_type: "PUBLIC" | "PRIVATE" | "TEMP";
  type:
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "DOCUMENT"
    | "OTHER"
    | "THUMBNAIL"
    | "BANNER";
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
  type?:
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "DOCUMENT"
    | "OTHER"
    | "THUMBNAIL"
    | "BANNER";
};

export type AssetListResponse = {
  data: AssetResponse[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export type AssetsHttpClient = {
  delete: HttpDelete;
  get: HttpGet;
  post: HttpWrite;
};
