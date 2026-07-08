# System API

## Trạng thái triển khai

Status: `implemented`

Backend modules:

```txt
apps/api/src/modules/health
apps/api/src/modules/common
```

Module này phục vụ health check và một số utility endpoint dùng chung.

## Health endpoints

Health không dùng global prefix `api/v1`.

```txt
GET /health/live
GET /health
GET /health/debug-sentry
```

Access:

- Public.
- Trong production, detailed health endpoint chỉ mở khi `HEALTH_ENDPOINTS_ENABLED=true`.

Ý nghĩa:

- `/health/live`: kiểm tra app còn sống.
- `/health`: kiểm tra database/system.
- `/health/debug-sentry`: gửi test event lên Sentry nếu endpoint được enable.

## Common endpoints

Common vẫn dùng global prefix.

```txt
GET /api/v1/common/uk-address?q=<keyword>
```

Ý nghĩa:

- Search UK address qua `CommonService`.

## FE states

- Admin system page có thể dùng `/health` cho trạng thái hệ thống.
- Public/customer UI thường không cần gọi `/health`.
- Với `/common/uk-address`, FE nên debounce input search và handle empty/error state.
