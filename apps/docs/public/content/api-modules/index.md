# API Modules

Tài liệu này tóm tắt các backend module hiện có trong `apps/api/src/modules` để FE biết BE đã triển khai những gì và gọi endpoint nào.

## Base URL

API app đặt global prefix:

```txt
/api/v1
```

Ví dụ controller `@Controller('products')` sẽ được gọi qua:

```txt
/api/v1/products
```

Riêng health check được exclude khỏi prefix:

```txt
/health
/health/live
```

## Cách chạy BE để test API

Từ root repo, chuẩn bị infra local:

```bash
pnpm infra:dev:up
```

Chuẩn bị Prisma/database nếu máy mới setup:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm db:seed:dev
```

Chạy API:

```bash
pnpm dev:api
```

API mặc định chạy ở:

```txt
http://localhost:4100
```

Ví dụ gọi products:

```txt
http://localhost:4100/api/v1/products
```

Chạy riêng docs này:

```bash
pnpm dev:docs
```

Mở:

```txt
http://127.0.0.1:8080
```

## Auth và cookie

- Access token trả về trong response login và FE gửi bằng header `Authorization: Bearer <token>`.
- Refresh token được BE set vào cookie theo context.
- Admin context dùng header `x-auth-context: admin`.
- Client/customer context mặc định là `client`, có thể gửi `x-auth-context: client`.

Cookie refresh đang dùng:

```txt
admin_refresh_token
admin_has_rt
client_refresh_token
client_has_rt
```

## Module đã triển khai

- `auth`: đăng ký, login admin/customer, refresh, profile, avatar, đổi password, verification.
- `users`: Admin quản trị user và permission override.
- `customers`: Admin quản lý hồ sơ customer.
- `products`: Admin quản lý sản phẩm, warranty code và owner.
- `warranties`: Admin/customer kích hoạt và tra cứu bảo hành.
- `warranty-claims`: tạo, tra cứu, list, assign trạm và cập nhật trạng thái yêu cầu bảo hành.
- `service-centers`: quản lý trạm bảo hành để assign claim và phục vụ trang trạm bảo hành.
- `assets`: upload/list/metadata/delete asset.
- `notifications`: thông báo admin và thông báo user.
- `system`: health check và common utility endpoint.

## Cách đọc từng module docs

Mỗi module docs chi tiết bên sidebar cố gắng trả lời đủ các câu FE cần trước khi code:

- Module đó dùng để làm gì.
- FE app nào nên dùng module đó.
- Base route và endpoint đầy đủ.
- Auth context/header cần gửi.
- Path params, query params, body.
- Response chính.
- Error message/status quan trọng.
- Behavior backend đáng chú ý.
- UI state và flow FE nên triển khai.

Nếu một endpoint chưa có pagination hoặc chưa persist một field, docs sẽ ghi rõ để FE không tự build sai expectation.

## Response shape

API đang dùng global response interceptor, nên FE nên kiểm tra response thực tế qua HTTP client hiện tại. Với các response nghiệp vụ, dữ liệu chính thường nằm trong `data` hoặc object trả trực tiếp từ use case tuỳ interceptor.

FE nên ưu tiên dùng helper trong:

```txt
packages/shared/src/http
packages/shared/src/types
```

## Quy ước lỗi FE cần xử lý

- `400`: validation sai hoặc payload thiếu field.
- `401`: chưa đăng nhập, token sai hoặc sai auth context.
- `403`: user không có role/permission.
- `404`: không tìm thấy record hoặc record không thuộc user hiện tại.
- `409`: trùng dữ liệu như email, username, warranty code.

## Module docs chi tiết

Mở từng mục trong sidebar:

- API Auth
- API Users
- API Customers
- API Products
- API Warranties
- API Claims
- API Service Centers
- API Assets
- API Notifications
- API System
