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

CD dùng GitHub Container Registry (GHCR) làm registry mặc định:

- `ghcr.io/<owner>/<repo>-api:<commit-sha>`
- `ghcr.io/<owner>/<repo>-web:<commit-sha>`
- `ghcr.io/<owner>/<repo>-admin:<commit-sha>`

Workflow `.github/workflows/cd.yml` chạy sau khi workflow `CI` xanh trên `main` và build/push image cho API, Web, Admin. Khi chưa có VPS/server, phần này đã đủ để có artifact deploy được.

Khi đã có server, chạy workflow `CD` thủ công với input `deploy=true`. Server cần có repo hoặc bundle deploy trong `DEPLOY_PATH`, file `.env.production`, Docker, Docker Compose, và quyền pull GHCR image.

Nếu GHCR package để private, đăng nhập registry trên server trước khi deploy:

```bash
echo "<github-token>" | docker login ghcr.io -u "<github-username>" --password-stdin
```

Token chỉ cần quyền đọc package/image.

GitHub Actions deployment secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PORT` (optional, mặc định `22`)
- `DEPLOY_PATH`
- `DEPLOY_API_HEALTH_URL` (optional)
- `DEPLOY_WEB_URL` (optional)
- `DEPLOY_ADMIN_URL` (optional)

Production `.env.production` cần cấu hình image:

- `API_IMAGE=ghcr.io/<owner>/<repo>-api`
- `WEB_IMAGE=ghcr.io/<owner>/<repo>-web`
- `ADMIN_IMAGE=ghcr.io/<owner>/<repo>-admin`
- `IMAGE_TAG=<commit-sha>`

Telegram secrets cần cấu hình trong GitHub Actions:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Nếu thiếu hai secret này, notification sẽ tự skip.
