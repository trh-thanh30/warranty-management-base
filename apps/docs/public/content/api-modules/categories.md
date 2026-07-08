# Categories API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/categories
```

Categories API quản lý taxonomy dùng chung cho Admin. Trước mắt module này phục vụ danh mục sản phẩm động để FE không phải hardcode enum khi hiển thị form/list sản phẩm. Model cũng hỗ trợ type khác để mở rộng sau như content page, asset hoặc nhóm lỗi claim.

## Base route

```txt
/api/v1/categories
```

## Auth chung

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

## Permissions

- List/detail: `CATEGORY_VIEW`
- Create: `CATEGORY_CREATE`
- Update: `CATEGORY_UPDATE`
- Deactivate: `CATEGORY_DELETE`

## Enums

```ts
type CategoryType =
  | "PRODUCT"
  | "CONTENT_PAGE"
  | "ASSET"
  | "WARRANTY_CLAIM_ISSUE";
```

## Response Category

```ts
type CategoryResponse = {
  id: string;
  type: CategoryType;
  code: string | null;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
```

## GET /api/v1/categories

Dùng cho: Admin list category và dropdown chọn category trong product form.

Query params:

```ts
type ListCategoriesQuery = {
  page?: number;
  limit?: number;
  type?: CategoryType;
  parentId?: string;
  isActive?: "true" | "false";
  search?: string;
  sortBy?: "name" | "slug" | "order" | "createdAt" | "updatedAt" | "isActive";
  sortOrder?: "asc" | "desc";
};
```

Response:

```ts
type Response = PaginatedResponse<CategoryResponse>;
```

FE triển khai chuẩn:

- Product form nên gọi `type=PRODUCT&isActive=true`.
- List manager nên có filter theo `type` và `isActive`.
- Tree UI dùng `parentId`; MVP có thể hiển thị flat table kèm parent name nếu chưa cần kéo thả.
- Sort mặc định theo `order asc`, sau đó `name asc`.

## POST /api/v1/categories

Dùng cho: Admin tạo category.

Body:

```ts
type CreateCategoryBody = {
  type: CategoryType;
  code?: string;
  slug?: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
};
```

Behavior:

- Nếu không gửi `slug`, BE tự sinh slug từ `name`.
- `slug` unique theo cặp `(type, slug)`.
- Nếu gửi `parentId`, parent phải tồn tại và cùng `type`.
- `code` được trim và uppercase.
- `isActive` mặc định `true`.

Error FE cần xử lý:

- `404 Parent category not found`
- `409 Category slug already exists for this type`
- `409 Parent category must have the same type`

## GET /api/v1/categories/:id

Dùng cho: Admin detail category.

Response:

```ts
type Response = CategoryResponse;
```

Error:

- `404 Category not found`

## PATCH /api/v1/categories/:id

Dùng cho: Admin cập nhật category.

Body:

```ts
type UpdateCategoryBody = {
  code?: string | null;
  slug?: string;
  name?: string;
  description?: string | null;
  parentId?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  order?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown> | null;
};
```

Behavior:

- Không cho category tự làm parent của chính nó.
- Nếu `parentId = null`, BE disconnect parent.
- Không đổi `type` sau khi tạo để tránh phá data đang liên kết.

Error FE cần xử lý:

- `404 Category not found`
- `404 Parent category not found`
- `409 Category cannot be its own parent`
- `409 Category slug already exists for this type`
- `409 Parent category must have the same type`

## DELETE /api/v1/categories/:id

Dùng cho: Admin deactivate category.

Behavior:

- Không xoá cứng.
- Set `isActive = false`.
- Product đang trỏ category vẫn giữ relation để lịch sử không mất ngữ nghĩa.

Response:

```ts
type Response = CategoryResponse;
```

## Metadata rule

`metadata` là extension field. FE không nên đặt các field cần search/filter/sort thường xuyên vào metadata. Những field như status, category, priority, due date, service center assignment phải là column riêng.
