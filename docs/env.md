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
- `MILLISECONDS_PER_DAY`: số mili giây trong một ngày, mặc định `86400000`.

### Database

- `DATABASE_URL`
- `DOCKER_DATABASE_URL`: tùy chọn ghi đè URL nội bộ cho container; để trống để Compose dùng service `db:5432`.
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
- `ASSET_CDN_URL`: base URL dùng để trả public asset URL. Khi dùng MinIO local, có thể đặt là `http://localhost:19000/warranty-management-base-public`.
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`.
- `MINIO_BUCKET_PUBLIC`, `MINIO_BUCKET_PRIVATE`, `MINIO_BUCKET_TEMP`.
- `MINIO_TEMP_RETENTION_DAYS`: số ngày giữ object trong bucket temp; `minio-init` cấu hình lifecycle tự động, mặc định 7 ngày.
- `STORAGE_CAPACITY_BYTES`: ngân sách dung lượng storage dùng để tính cảnh báo 70/85/95%; bỏ trống nếu chưa xác định.
- `STORAGE_USAGE_MONITOR_ENABLED`, `STORAGE_USAGE_MONITOR_CRON`: bật và đặt lịch job thống kê dung lượng.
- `WARRANTY_CERTIFICATE_CLEANUP_ENABLED`, `WARRANTY_CERTIFICATE_CLEANUP_DRY_RUN`, `WARRANTY_CERTIFICATE_CLEANUP_CRON`, `WARRANTY_CERTIFICATE_ORPHAN_RETENTION_DAYS`: cấu hình job dọn PDF chứng nhận mồ côi.

### Warranty Certificate PDF Renderer

- `PDF_RENDERER_URL`: URL nội bộ của Chromium renderer. Docker Compose tự đặt thành `http://pdf-renderer:3001`; không public cổng này ra ngoài.
- `PDF_RENDER_TIMEOUT_MS`: thời gian tối đa để render một PDF, mặc định `45000` ms.
- `PDF_MAX_BODY_BYTES`: giới hạn request HTML gửi tới renderer, mặc định `10485760` byte.
- `PUPPETEER_EXECUTABLE_PATH`: đường dẫn Chrome/Edge/Chromium dùng khi chạy API trực tiếp trên máy và không cấu hình `PDF_RENDERER_URL`.

Khi phát triển không qua Docker, API có thể tự tìm Chrome/Edge đã cài hoặc dùng đường dẫn được cấu hình. Khi chạy qua Compose, API luôn gọi renderer nội bộ để dev và production sử dụng cùng engine in PDF.

### Telegram CI

Chỉ cần cấu hình trên GitHub Actions Secrets:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Không cần đưa token thật vào file env local.

### CD / Deployment

Workflow `Publish Images` build và push Docker image lên GitHub Container Registry:

- `API_IMAGE`
- `PDF_RENDERER_IMAGE`
- `WEB_IMAGE`
- `ADMIN_IMAGE`
- `IMAGE_TAG`

Khi deploy qua workflow `Deploy` tới VPS/server, cấu hình các GitHub Actions Secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PORT` (optional)
- `DEPLOY_PATH`
- `DEPLOY_API_HEALTH_URL` (optional)
- `DEPLOY_WEB_URL` (optional)
- `DEPLOY_ADMIN_URL` (optional)

Server cần có `.env.production` chứa app/database/redis/minio secrets và các biến image ở trên.

Nếu GHCR image là private, server cần đăng nhập `ghcr.io` bằng GitHub token có quyền đọc package trước khi chạy `docker compose pull`.

## Rule

- Biến public cho Next.js phải bắt đầu bằng `NEXT_PUBLIC_`.
- Secret không dùng prefix `NEXT_PUBLIC_`.
- Không đọc env trực tiếp rải rác trong UI component.
- Gom env mapping vào config module khi số lượng biến tăng.
- `.env.example` phải có comment đủ rõ nhưng không chứa secret thật.
