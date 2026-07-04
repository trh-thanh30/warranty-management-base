# API Module Template

Dùng template này khi thêm docs cho backend module mới.

## Trạng thái triển khai

Status: `implemented | partial | draft | deprecated`

Backend module:

```txt
apps/api/src/modules/<module-name>
```

FE dùng ở:

```txt
apps/admin/src/views/<feature>
apps/web/src/views/<feature>
```

## Phạm vi hiện tại

BE đã hỗ trợ:

- Chức năng 1.
- Chức năng 2.

BE chưa hỗ trợ:

- Chức năng chưa làm 1.
- Chức năng chưa làm 2.

## Quyền truy cập

- Admin: mô tả role/permission cần có.
- Moderator: mô tả role/permission cần có.
- Customer: mô tả role/permission cần có.
- Guest: mô tả endpoint public nếu có.

## Base route

```txt
/api/v1/<module-name>
```

## Endpoint: METHOD /api/v1/<path>

Dùng cho: `Admin | Web | Both`

Auth: `required | optional | public`

Permission:

```txt
PERMISSION_NAME
```

Mục đích:

- Mô tả endpoint làm gì.

Query params:

```ts
type Query = {
  page?: number;
  limit?: number;
};
```

Body:

```ts
type Body = {
  name: string;
};
```

Response chính:

```ts
type Response = {
  id: string;
};
```

Validation:

- Field A: required.
- Field B: enum.

FE states:

- Loading: skeleton/list placeholder.
- Empty: empty state nếu data rỗng.
- Error: hiển thị message từ API.
- Success: cập nhật cache/list/detail.

## Shared contracts

Shared types nên đặt ở:

```txt
packages/shared/src/types/<module-name>.types.ts
```

Backend-only DTO đặt ở:

```txt
apps/api/src/modules/<module-name>/dto
```

## Changelog

- YYYY-MM-DD: tạo docs ban đầu.
