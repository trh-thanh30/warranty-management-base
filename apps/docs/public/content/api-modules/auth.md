# Auth API

## Module này làm gì

Backend module:

```txt
apps/api/src/modules/auth
```

Auth API xử lý đăng ký, đăng nhập riêng cho Admin và Customer, refresh token bằng httpOnly cookie, lấy/cập nhật profile hiện tại, upload avatar, đổi mật khẩu, verify email và reset password.

FE dùng module này cho:

- Admin login session.
- Customer login/register session.
- Auth bootstrap bằng `GET /me`.
- Refresh access token.
- Profile settings.
- Email verification screen.
- Forgot/reset password flow.

## Base route

```txt
/api/v1/auth
```

## Auth context

Admin app:

```txt
x-auth-context: admin
```

Customer web:

```txt
x-auth-context: client
```

Nếu không gửi header này, BE mặc định là `client`.

Refresh cookie theo context:

```txt
admin_refresh_token
admin_has_rt
client_refresh_token
client_has_rt
```

## AuthUser response

```ts
type AuthUser = {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "admin" | "moderator" | "customer" | null;
  permissions: string[];
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};
```

## POST /api/v1/auth/register

Dùng cho: Customer register.

Auth: public.

Body:

```ts
type RegisterBody = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
```

Validation:

- `username`: required.
- `email`: email hợp lệ.
- `password`: tối thiểu 6 ký tự.
- `confirmPassword`: phải khớp password.

Response:

```ts
type RegisterResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    is_verified: boolean;
  };
  sessionId: string;
};
```

BE behavior:

- Kiểm tra email/username chưa tồn tại.
- Hash password.
- Tạo verification session.
- Gửi email verification code 6 chữ số, TTL 15 phút.

Error:

- `409 An account with this email already exists`.
- `409 Username is already taken`.

FE triển khai chuẩn:

- Sau register success, route sang màn hình nhập verification code và giữ `sessionId`.
- Không tự login sau register vì account chưa verify.

## POST /api/v1/auth/login-admin

Dùng cho: Admin app login.

Auth: public.

Body:

```ts
type LoginBody = {
  usernameOrEmail: string;
  password: string;
};
```

Response:

```ts
type LoginResponse = {
  access_token: string;
  user: AuthUser;
};
```

BE behavior:

- Chỉ cho role `ADMIN` hoặc `MODERATOR`.
- Set `admin_refresh_token` và `admin_has_rt`.
- Trả access token và auth user kèm permissions.

Error:

- `401 Invalid email/username or password`.
- `400 Please verify your email before logging in` với details `{ requiresVerification: true, sessionId }`.
- `400 Account is inactive. Please contact support`.

FE triển khai chuẩn:

- Lưu access token trong auth state.
- Nếu error có `requiresVerification`, chuyển tới verification flow.
- Gửi `x-auth-context: admin` cho các request sau.

## POST /api/v1/auth/login

Dùng cho: Customer web login.

Auth: public.

Body giống login-admin.

Response giống login-admin.

BE behavior:

- Chỉ cho role `CUSTOMER`.
- Set `client_refresh_token` và `client_has_rt`.

FE triển khai chuẩn:

- Customer web không dùng login-admin.
- Gửi `x-auth-context: client` cho các request sau.

## POST /api/v1/auth/refresh

Dùng cho: Admin/Web refresh access token.

Auth: public nhưng cần refresh cookie.

Headers:

```ts
type Headers = {
  "x-auth-context"?: "admin" | "client";
};
```

Body/query/params:

```ts
type Body = never;
type Query = {};
type Params = {};
```

Response:

```ts
type RefreshResponse = {
  access_token: string;
};
```

BE behavior:

- Đọc refresh cookie theo auth context.
- Verify refresh token và role hợp lệ cho app context.
- Giữ refresh token cũ ổn định, chỉ phát access token mới.
- Nếu refresh fail, clear refresh cookie theo context.

Error:

- `401 Refresh token is missing`.
- `401 Invalid or expired refresh token`.
- `401 Invalid refresh token for this app`.

FE triển khai chuẩn:

- Khi access token hết hạn, gọi refresh đúng context.
- Nếu refresh fail, clear auth state và redirect login.

## GET /api/v1/auth/me

Dùng cho: Bootstrap session và lấy profile hiện tại.

Auth: required.

Headers:

```txt
Authorization: Bearer <access_token>
x-auth-context: admin | client
```

Response:

```ts
type Response = AuthUser;
```

BE behavior:

- Kiểm tra role của user có khớp auth context không.
- Trả permissions hiệu lực.

Error:

- `401 Invalid session for this app`.
- `404 User not found`.

FE triển khai chuẩn:

- App load gọi `/me` để hydrate current user.
- Nếu `Invalid session for this app`, logout khỏi app hiện tại.
- Dùng `permissions` để render/hide UI actions.

## PATCH /api/v1/auth/me

Dùng cho: Profile settings.

Auth: required.

Body:

```ts
type UpdateProfileBody = {
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};
```

Validation:

- `username`: 2 đến 80 ký tự.
- `email`: email hợp lệ, tối đa 160 ký tự.
- `full_name`: tối đa 120 ký tự hoặc null.
- `phone`: tối đa 32 ký tự hoặc null.

Response:

```ts
type Response = AuthUser;
```

Error:

- `409 An account with this email already exists`.
- `409 Username is already taken`.
- `409 Phone number is already taken`.
- `401 Invalid session for this app`.

FE triển khai chuẩn:

- Trim empty text thành null nếu muốn clear.
- Sau success cập nhật auth user cache.

## PATCH /api/v1/auth/me/avatar

Dùng cho: Upload avatar profile.

Auth: required.

Request:

```txt
multipart/form-data
field file: binary
```

Response:

```ts
type Response = AuthUser;
```

BE behavior:

- Upload file qua AssetsService với folder `avatars`, type `IMAGE`, accessType `PUBLIC`.
- Update `avatar_url` của user bằng asset url.

Error:

- `400 Avatar file is required`.
- Các lỗi validation file từ assets module.

FE triển khai chuẩn:

- Dùng file input hoặc dropzone.
- Disable submit khi upload.
- Sau success thay avatar preview bằng `avatar_url` mới.

## PATCH /api/v1/auth/change-password

Dùng cho: Đổi mật khẩu trong profile settings.

Auth: required.

Body:

```ts
type ChangePasswordBody = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};
```

Response:

```ts
type Response = void;
```

BE behavior:

- Kiểm tra current password.
- New password phải khác current password.
- Nếu đổi thành công, clear refresh cookie để buộc login lại.

Error:

- `401 Current password is incorrect`.
- `400 New password must be different from current password`.

FE triển khai chuẩn:

- Sau success, logout local state và redirect login.

## POST /api/v1/auth/logout

Dùng cho: Admin/Web logout.

Auth: public.

Headers:

```txt
x-auth-context: admin | client
```

Response:

```ts
type Response = void;
```

BE behavior:

- Clear refresh cookies theo context.

FE triển khai chuẩn:

- Gọi logout rồi clear local access token.
- Nếu API logout fail vì network, vẫn nên clear local state.

## POST /api/v1/auth/verify

Dùng cho: Verify account bằng code email.

Auth: public.

Body:

```ts
type VerifyEmailBody = {
  sessionId: string;
  code: string;
};
```

Response:

```ts
type Response = void;
```

Error:

- `401 Invalid or expired verification session`.
- `404 User not found`.
- `400 Account is already verified`.
- `400 Invalid or expired verification code`.

FE triển khai chuẩn:

- Code input 6 digits.
- Sau success, route về login.

## POST /api/v1/auth/forgot-password

Dùng cho: Request reset password.

Auth: public.

Body:

```ts
type ForgotPasswordBody = {
  email: string;
};
```

Response:

```ts
type Response = {
  sessionId: string;
};
```

Error:

- `404 User with this email not found`.

FE triển khai chuẩn:

- Sau success, route sang reset password code screen với `sessionId`.

## POST /api/v1/auth/reset-password

Dùng cho: Reset password bằng code.

Auth: public.

Body:

```ts
type ResetPasswordBody = {
  sessionId: string;
  code: string;
  password: string;
  confirmPassword: string;
};
```

Response:

```ts
type Response = void;
```

Error:

- `401 Invalid or expired password reset session`.
- `404 User not found`.
- `400 Invalid or expired verification code`.

FE triển khai chuẩn:

- Sau success, route login.

## POST /api/v1/auth/resend-verification

Dùng cho: Gửi lại verification code.

Auth: public.

Body:

```ts
type ResendVerificationBody = {
  sessionId: string;
};
```

Response:

```ts
type Response = void;
```

Error:

- `401 Invalid or expired verification session`.
- `404 User not found`.
- `400 Account is already verified`.
- `429 Too many verification requests. Please try again later.`

FE triển khai chuẩn:

- Có cooldown UI để tránh spam.
- Nếu 429, disable resend tạm thời.

## POST /api/v1/auth/request-verification

Dùng cho: Tạo verification session mới khi user biết email.

Auth: public.

Body:

```ts
type RequestVerificationBody = {
  email: string;
};
```

Response:

```ts
type Response = {
  sessionId: string;
};
```

Error:

- `404 User not found`.
- `400 Account is already verified`.

FE triển khai chuẩn:

- Dùng khi sessionId cũ mất/hết hạn.
- Sau success, route vào verify code screen.
