# Users API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/user
```

Users API phục vụ Admin quản trị user account và permission override. Customer profile nghiệp vụ nằm ở Customers API, còn Users API quản lý account, role, status, password và permission.

FE Admin dùng module này cho:

- User management list/detail.
- Quản lý riêng nhóm `MODERATOR` và `CUSTOMER`.
- Tạo user nội bộ.
- Update role/status/account fields.
- Delete user.
- Màn hình permission override.

## Base route

```txt
/api/v1/users
```

## Auth chung

```txt
Authorization: Bearer <access_token>
x-auth-context: admin
```

Controller dùng:

```txt
JwtAuthGuard
RolesGuard
```

Role yêu cầu cho tất cả endpoint:

```txt
ADMIN
```

## GET /api/v1/users

Dùng cho: Admin user list.

Permission:

```txt
USER_VIEW
```

Params/query/body:

```ts
type Params = {};
type Query = {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "MODERATOR" | "CUSTOMER";
  roles?: string;
  status?: "ACTIVE" | "INACTIVE";
  sortBy?:
    | "email"
    | "username"
    | "fullName"
    | "phone"
    | "role"
    | "status"
    | "createdAt"
    | "updatedAt";
  sortOrder?: "asc" | "desc";
};
type Body = never;
```

Response:

```ts
type Response = PaginatedResponse<User>;
```

BE behavior:

- Có pagination chuẩn qua `page`, `limit`.
- `search` match theo `email`, `username`, `full_name`, `phone`.
- `role` filter một role.
- `roles` filter nhiều role bằng comma-separated string, ví dụ `MODERATOR,CUSTOMER`.
- Nếu gửi cả `role` và `roles`, BE ưu tiên `roles`.
- `status` filter theo trạng thái account.
- Sort mặc định theo `created_at desc`.

FE triển khai chuẩn:

- Màn quản lý moderator/customer dùng `roles=MODERATOR,CUSTOMER`.
- Tab riêng moderator dùng `role=MODERATOR`.
- Tab riêng customer dùng `role=CUSTOMER`.
- FE dùng `meta.total`, `meta.totalPages`, `meta.hasNextPage` để render pagination.
- Search input nên debounce khoảng 300ms.

Ví dụ:

```txt
GET /api/v1/users?roles=MODERATOR,CUSTOMER&page=1&limit=20
GET /api/v1/users?role=MODERATOR&search=nguyen
```

## POST /api/v1/users

Dùng cho: Admin create user.

Permission:

```txt
USER_CREATE
```

Body:

```ts
type CreateUserBody = {
  username: string;
  email: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: "ADMIN" | "MODERATOR" | "CUSTOMER";
  status?: string;
};
```

Validation:

- `username`: required string.
- `email`: email.
- `password`: không gửi khi tạo `MODERATOR`; backend tự sinh. Bắt buộc và tối thiểu 8 ký tự với loại account khác.
- `full_name`: required by the service when role is `MODERATOR`.
- `phone`: optional, maximum 32 characters.
- `role`: Prisma `user_role` enum nếu gửi.
- `status`: Prisma `user_status` enum nếu gửi.

Response:

```ts
type ModeratorResponse = {
  user: User;
  temporaryPassword: string;
};

type OtherUserResponse = User;
```

BE behavior:

- Khi tạo `MODERATOR`, backend sinh mật khẩu tạm 12 ký tự có chữ thường, chữ hoa, số và ký tự đặc biệt.
- Chỉ password hash được lưu trong database.
- Plaintext temporary password chỉ trả về trong response tạo Moderator và không thể truy xuất lại.
- Admin-created Moderator accounts are stored with `is_verified=true`.
- User responses never include password hashes or refresh tokens.
- Nếu `email`, `username` hoặc `phone` bị trùng, API trả `409` với code `USER_ACCOUNT_EXISTS` và `error.details.fields`.

FE triển khai chuẩn:

- Hiển thị temporary password đúng một lần và cho phép Admin copy trước khi tiếp tục phân quyền.
- Sau success refresh list.
- Nếu role là CUSTOMER và cần customer profile, tạo thêm customer qua Customers API.

## GET /api/v1/users/:id

Dùng cho: Admin user detail.

Permission:

```txt
USER_VIEW
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = User | null;
```

FE triển khai chuẩn:

- Nếu response null hoặc 404 từ filter global, show not-found state.

## PUT /api/v1/users/:id

Dùng cho: Admin update user.

Permission:

```txt
USER_UPDATE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateUserBody = {
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  password?: string;
  role?: "ADMIN" | "MODERATOR" | "CUSTOMER";
  status?: string;
  is_verified?: boolean;
};
```

Response:

```ts
type Response = User;
```

BE behavior:

- Nếu gửi `password`, BE hash password.
- Update trực tiếp bằng Prisma.

FE triển khai chuẩn:

- Password field nên optional và blank by default.
- Nếu không đổi password, không gửi field `password`.
- Role/status dùng select từ enum.

## DELETE /api/v1/users/:id

Dùng cho: Admin delete user.

Permission:

```txt
USER_DELETE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type Response = User;
```

BE behavior:

- Delete thật qua Prisma, không phải soft delete.

FE triển khai chuẩn:

- Luôn có confirm dialog.
- Sau success remove khỏi list.
- Cẩn thận khi user đang linked customer/product; BE có thể trả lỗi constraint từ Prisma nếu quan hệ chặn delete.

## GET /api/v1/users/:id/permissions

Dùng cho: Admin xem effective permissions và override của user.

Permission:

```txt
USER_PERMISSION_MANAGE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Response:

```ts
type UserPermissionsResponse = {
  userId: string;
  role: "admin" | "moderator" | "customer" | null;
  effectivePermissions: string[];
  overrides: Array<{
    permissionKey: string;
    granted: boolean;
  }>;
};
```

Error:

- `404 User not found`.

FE triển khai chuẩn:

- Render permissions theo group từ `PERMISSION_GROUPS`.
- `effectivePermissions` là kết quả cuối cùng để UI preview quyền user có.
- `overrides` là phần admin chỉnh riêng.

## PUT /api/v1/users/:id/permissions

Dùng cho: Admin cập nhật permission override.

Permission:

```txt
USER_PERMISSION_MANAGE
```

Path params:

```ts
type Params = {
  id: string;
};
```

Body:

```ts
type UpdateUserPermissionsBody = {
  overrides: Array<{
    permissionKey: string;
    granted: boolean;
  }>;
};
```

Response:

```ts
type Response = UserPermissionsResponse;
```

FE triển khai chuẩn:

- Gửi toàn bộ overrides hiện tại, không chỉ delta, trừ khi UI chắc service merge delta.
- Sau save, dùng response để update effectivePermissions.
- Nếu user đổi role ở màn khác, refetch permissions vì default role permissions thay đổi.
