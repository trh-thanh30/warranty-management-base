# Notifications API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/notification
```

Notifications API phục vụ hai nhóm:

- Admin tạo/list/publish notification.
- User xem notification của mình, đếm unread, mark read.

FE Admin dùng module này cho notification management. FE Web/Admin shell dùng module này cho notification bell và notification center.

## Base route

```txt
/api/v1/notifications
```

## Auth chung

```txt
Authorization: Bearer <access_token>
```

## POST /api/v1/notifications/admin

Dùng cho: Admin tạo notification.

Role:

```txt
ADMIN
```

Body:

```ts
type CreateAdminNotificationBody = {
  title: string;
  content: string;
  type: string;
  scope: "ALL" | "ROLE" | "USER";
  target_roles?: Array<"ADMIN" | "MODERATOR" | "CUSTOMER">;
  target_user_ids?: string[];
  scheduled_at?: string;
  metadata?: Record<string, unknown>;
};
```

Validation:

- `title`, `content`, `type`: required string.
- `scope`: enum notification_scope.
- Nếu `scope = ROLE`, cần `target_roles`.
- Nếu `scope = USER`, cần `target_user_ids`.
- `scheduled_at`: ISO date string nếu gửi.

Response:

```ts
type Response = Notification;
```

FE triển khai chuẩn:

- UI nên đổi form fields theo scope.
- ROLE scope: multi-select roles.
- USER scope: user picker.
- Nếu scheduled_at có giá trị, show trạng thái scheduled.

## GET /api/v1/notifications/admin

Dùng cho: Admin/moderator list notification.

Role:

```txt
ADMIN | MODERATOR
```

Query params:

```ts
type ListAdminNotificationsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  source?: string;
  scope?: string;
  delivery_status?: string;
};
```

Response:

```ts
type Response = {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};
```

BE behavior:

- Default page 1, limit 10.
- Max limit 100.
- Response đi qua `PaginatedResponse.from`.

FE triển khai chuẩn:

- Dùng server pagination.
- Search q debounce.
- Filter theo source/scope/delivery_status nếu UI cần.

## POST /api/v1/notifications/admin/scheduled/publish

Dùng cho: Admin publish scheduled notifications đến hạn.

Role:

```txt
ADMIN
```

Params/query/body:

```ts
type Params = {};
type Query = {};
type Body = never;
```

Response:

```ts
type Response = unknown;
```

FE triển khai chuẩn:

- Dùng làm admin action.
- Sau success refetch admin notifications.
- Hiển thị toast theo response message nếu có.

## GET /api/v1/notifications/unread-count

Dùng cho: Notification bell.

Auth: required.

Response:

```ts
type Response = {
  unread: number;
};
```

FE triển khai chuẩn:

- Gọi khi app shell mount.
- Refetch sau mark read/read all.
- Có thể poll nhẹ nếu cần realtime giả.

## GET /api/v1/notifications

Dùng cho: User notification center.

Auth: required.

Query params:

```ts
type ListNotificationsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  status?: string;
};
```

Response:

```ts
type Response = {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};
```

FE triển khai chuẩn:

- Filter unread/read bằng `status`.
- Empty state khi không có notification.
- Infinite scroll hoặc pagination đều được vì response có meta.

## GET /api/v1/notifications/:id

Dùng cho: User notification detail.

Auth: required.

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = Notification;
```

BE behavior:

- Chỉ lấy notification thuộc user hiện tại.

FE triển khai chuẩn:

- Nếu 404/403, show not-found/no-access state.

## PATCH /api/v1/notifications/read-all

Dùng cho: Mark all user notifications as read.

Auth: required.

Response:

```ts
type Response = unknown;
```

FE triển khai chuẩn:

- Optimistic update unread count về 0.
- Set all visible items read.
- Refetch list/count sau success hoặc on settled.

## PATCH /api/v1/notifications/:id/read

Dùng cho: Mark one notification as read.

Auth: required.

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = Notification;
```

FE triển khai chuẩn:

- Optimistic update item read state.
- Decrement unread count nếu item trước đó unread.

## Checklist UI Notifications

- Shell dùng unread-count.
- Notification center dùng paginated list.
- Admin management dùng admin endpoints.
- Scope-specific create form phải validate target_roles/target_user_ids.
- Mark-read actions nên optimistic nhưng refetch lại để đồng bộ.
