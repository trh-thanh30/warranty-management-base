# Users API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/user
```

Users API phục vụ Admin quản trị user account và permission override. Customer profile nghiệp vụ nằm ở Customers API, còn Users API quản lý account, role, status, password và permission.

FE Admin dùng module này cho:

- User management list/detail.
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
type Query = {};
type Body = never;
```

Response:

```ts
type Response = User[];
```

BE behavior:

- Trả toàn bộ users.
- Hiện chưa có pagination/filter.

FE triển khai chuẩn:

- Chưa build pagination server-side cho endpoint này.
- Nếu cần search/filter lớn, cần request BE bổ sung query.

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
  password: string;
  role?: "ADMIN" | "MODERATOR" | "CUSTOMER";
  status?: string;
};
```

Validation:

- `username`: required string.
- `email`: email.
- `password`: required string.
- `role`: Prisma `user_role` enum nếu gửi.
- `status`: Prisma `user_status` enum nếu gửi.

Response:

```ts
type Response = User;
```

BE behavior:

- Hash password trước khi lưu.

FE triển khai chuẩn:

- Không hiển thị password sau create.
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
