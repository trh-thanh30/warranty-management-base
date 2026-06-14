# Deployment

Tài liệu này mô tả hướng build và deploy cho repo base. Repo không hardcode provider để có thể dùng với nhiều môi trường khác nhau.

## Build Local

```bash
pnpm build:packages
pnpm build:api
pnpm build:web
pnpm build:admin
```

Hoặc build toàn bộ:

```bash
pnpm build
```

## Docker

Build image:

```bash
pnpm docker:build:api
pnpm docker:build:web
pnpm docker:build:admin
pnpm docker:build:all
```

Kiểm tra Dockerfile:

```bash
pnpm docker:check:all
```

## Docker Compose

Development:

```bash
pnpm infra:dev:up
pnpm infra:dev:logs
pnpm infra:dev:down
```

Production-like:

```bash
pnpm infra:prod:config
pnpm infra:prod:up
pnpm infra:prod:logs
pnpm infra:prod:down
```

Production compose dùng image qua biến:

- `API_IMAGE`
- `WEB_IMAGE`
- `ADMIN_IMAGE`
- `IMAGE_TAG`

## Database Migration

Không chạy Prisma migrate tự động trong app startup.

Development:

```bash
pnpm prisma:migrate:dev
```

Production:

```bash
pnpm prisma:migrate:prod
```

## CI/CD

GitHub Actions hiện tách job:

- Packages
- API
- Web
- Admin
- Telegram notification

Telegram secrets cần cấu hình trong GitHub Actions:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Nếu thiếu hai secret này, notification sẽ tự skip.
