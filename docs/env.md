# Environment Variables

Repo dùng nhiều file env theo môi trường. File mẫu là `.env.example`.

## File Env

| File               | Vai trò                                       |
| :----------------- | :-------------------------------------------- |
| `.env.example`     | Mẫu public, được commit.                      |
| `.env.development` | Cấu hình local/dev, không commit secret thật. |
| `.env.test`        | Cấu hình test.                                |
| `.env.production`  | Cấu hình production/deploy, không commit.     |

## Nhóm Biến Chính

### App Ports

- `API_PORT`
- `WEB_PORT`
- `ADMIN_PORT`

### Database

- `DATABASE_URL`
- `DIRECT_URL`
- `DEV_DB_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

### Redis

- `REDIS_URL`
- `REDIS_DEV_PORT`
- `REDIS_DB_PORT`

### Asset Storage

- `STORAGE_DRIVER`: `local` hoặc `minio`.
- `ASSET_CDN_URL`: base URL dùng để trả public asset URL. Khi dùng MinIO local, có thể đặt là `http://localhost:9000/booking-public`.
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`.
- `MINIO_BUCKET_PUBLIC`, `MINIO_BUCKET_PRIVATE`, `MINIO_BUCKET_TEMP`.

### Telegram CI

Chỉ cần cấu hình trên GitHub Actions Secrets:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Không cần đưa token thật vào file env local.

## Rule

- Biến public cho Next.js phải bắt đầu bằng `NEXT_PUBLIC_`.
- Secret không dùng prefix `NEXT_PUBLIC_`.
- Không đọc env trực tiếp rải rác trong UI component.
- Gom env mapping vào config module khi số lượng biến tăng.
- `.env.example` phải có comment đủ rõ nhưng không chứa secret thật.
