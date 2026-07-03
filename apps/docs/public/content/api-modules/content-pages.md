# Content Pages API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/content-pages
```

Content Pages API quản lý nội dung “Chính sách và hướng dẫn” cho website. Admin tạo/sửa nội dung, main FE đọc các trang đã publish.

## Base routes

Admin:

```txt
/api/v1/content-pages
```

Public:

```txt
/api/v1/public/content-pages
```

## Enums

```ts
type ContentPageKind = "POLICY" | "GUIDE" | "INTRO" | "FAQ";
type ContentPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
```

## Response

```ts
type ContentPageResponse = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  kind: ContentPageKind;
  status: ContentPageStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## Admin endpoints

### GET /api/v1/content-pages

Permission: `CONTENT_PAGE_VIEW`

Query:

```ts
type Query = {
  search?: string;
  kind?: ContentPageKind;
  status?: ContentPageStatus;
};
```

### POST /api/v1/content-pages

Permission: `CONTENT_PAGE_CREATE`

Body:

```ts
type Body = {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  kind?: ContentPageKind;
  status?: ContentPageStatus;
  publishedAt?: string;
};
```

Slug chỉ dùng chữ thường, số và dấu `-`, ví dụ `chinh-sach-bao-hanh`.

### GET /api/v1/content-pages/:id

Permission: `CONTENT_PAGE_VIEW`

### PATCH /api/v1/content-pages/:id

Permission: `CONTENT_PAGE_UPDATE`

Body giống create nhưng tất cả field optional.

Nếu chuyển status sang `PUBLISHED` mà không gửi `publishedAt`, BE tự set thời điểm hiện tại.

### DELETE /api/v1/content-pages/:id

Permission: `CONTENT_PAGE_DELETE`

Response:

```ts
type Response = {
  success: true;
};
```

## Public endpoints

### GET /api/v1/public/content-pages

Không cần auth. Chỉ trả trang `PUBLISHED`.

Query:

```ts
type Query = {
  search?: string;
  kind?: ContentPageKind;
};
```

### GET /api/v1/public/content-pages/:slug

Không cần auth. Chỉ trả trang `PUBLISHED` theo slug.

Error:

- `404 Published content page not found`

## FE triển khai chuẩn

- Trang “Chính sách và hướng dẫn” nên gọi list public với `kind=POLICY` hoặc `kind=GUIDE`.
- Detail page dùng slug thay vì id.
- Admin nên có preview content và trạng thái draft/published/archived.
- Không render trang `DRAFT` ngoài main FE.
