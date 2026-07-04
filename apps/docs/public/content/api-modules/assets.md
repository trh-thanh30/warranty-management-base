# Assets API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/assets
```

Assets API quản lý upload file, asset metadata, URL public/private và soft delete asset. Auth profile avatar cũng dùng AssetsService bên trong.

FE dùng module này cho:

- Upload avatar.
- Upload media/file trong Admin.
- Admin asset manager.
- Public thumbnail preview.

## Base route

```txt
/api/v1/assets
```

## Auth chung

Controller dùng:

```txt
JwtAuthGuard
RolesGuard
```

Ngoại lệ:

```txt
GET /api/v1/assets/thumbnail
```

endpoint thumbnail là public.

## Response Asset

```ts
type AssetWithUrl = {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  access_type: "PUBLIC" | "PRIVATE" | "TEMP";
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "THUMBNAIL" | "OTHER";
  folder: string | null;
  metadata: Record<string, unknown> | null;
  is_deleted: boolean;
  uploaded_by_id: string | null;
  created_at: string;
  updated_at: string;
  url: string;
};
```

## POST /api/v1/assets/upload

Dùng cho: Upload file authenticated.

Auth: required.

Request:

```txt
Content-Type: multipart/form-data
field file: binary
```

Query params:

```ts
type UploadAssetQuery = {
  folder?: string;
  entityId?: string;
  entityType?: string;
  accessType?: "PUBLIC" | "PRIVATE" | "TEMP";
  type?: string;
};
```

Validation:

- `folder`: tối đa 100 ký tự.
- `entityId`: UUID nếu gửi.
- `entityType`: tối đa 50 ký tự.
- `accessType`: enum `PUBLIC`, `PRIVATE`, `TEMP`.
- `type`: tối đa 20 ký tự.

Response:

```ts
type Response = AssetWithUrl;
```

BE behavior:

- Validate file bằng FileValidatorService.
- Lưu file theo path `year/month/folder`.
- Tự tạo filename unique.
- Nếu không gửi `accessType`, default là `PUBLIC`.
- Nếu gửi `entityId` và `entityType`, BE tạo asset link metadata.
- `url` được resolve từ CDN cho PUBLIC.

FE triển khai chuẩn:

- Dùng `FormData`.
- Field file phải tên là `file`.
- Disable submit khi upload.
- Sau success lưu `asset.url` hoặc `asset.id` tuỳ feature.

## GET /api/v1/assets/thumbnail

Dùng cho: Public thumbnail gallery/preview.

Auth: public.

Params/query/body:

```ts
type Params = {};
type Query = {};
type Body = never;
```

Response:

```ts
type Response = {
  data: AssetWithUrl[];
  pagination: {
    total: number;
    page: 1;
    limit: 10;
    totalPages: number;
  };
};
```

BE behavior:

- Chỉ lấy asset chưa deleted.
- Chỉ lấy `access_type = PUBLIC`.
- Chỉ lấy `type = THUMBNAIL`.
- Limit cố định 10.
- Sort `created_at desc`.

FE triển khai chuẩn:

- Dùng cho preview public, không cần token.
- Empty state nếu `data` rỗng.

## GET /api/v1/assets

Dùng cho: Admin asset list.

Auth: required.

Role:

```txt
ADMIN
```

Query params:

```ts
type ListAssetsQuery = {
  page?: number;
  limit?: number;
  uploadedById?: string;
  type?: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "THUMBNAIL" | "OTHER";
  accessType?: "PUBLIC" | "PRIVATE" | "TEMP";
  folder?: string;
};
```

Response:

```ts
type Response = {
  data: AssetWithUrl[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
```

BE behavior:

- Default `page = 1`, `limit = 10`.
- Filter `is_deleted = false`.
- Filter optional theo uploadedById/type/accessType/folder.
- Sort `created_at desc`.

FE triển khai chuẩn:

- Đây là endpoint có pagination thật.
- Table/grid nên đọc `pagination.totalPages`.
- Folder filter là contains search.

## GET /api/v1/assets/:id

Dùng cho: Get asset metadata/detail.

Auth: required.

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = AssetWithUrl;
```

Error:

- `404 Asset not found` nếu không tồn tại hoặc đã soft delete.

FE triển khai chuẩn:

- Dùng khi cần inspect asset detail.
- Nếu 404, show not-found state.

## DELETE /api/v1/assets/:id

Dùng cho: Delete asset.

Auth: required.

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = void;
```

BE behavior:

- Soft delete DB bằng `is_deleted = true`.
- Xoá file khỏi storage.
- Chỉ uploader hoặc ADMIN được xoá.

Error:

- `404 Asset not found`.
- `403 You do not have permission to delete this asset`.

FE triển khai chuẩn:

- Có confirm dialog.
- Sau success remove item khỏi list.
- Nếu user không phải uploader/admin, hide delete action nếu FE biết.

## Checklist UI Assets

- Upload dùng FormData field `file`.
- Image preview dùng `url`.
- List admin đọc pagination từ response.
- Delete là soft delete.
- Avatar profile có thể dùng Auth API `PATCH /auth/me/avatar` thay vì gọi assets trực tiếp.
