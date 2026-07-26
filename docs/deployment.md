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

### Docker Compose project trên VPS

VPS hiện đã có project ecommerce:

```text
ecommerce-production   /root/ecommerce-production/docker-compose.deploy.yml
```

Warranty phải dùng thư mục và Compose project riêng:

```text
/root/warranty-management-production
```

Trong `/root/warranty-management-production/.env.production`, cấu hình:

```env
COMPOSE_PROJECT_NAME=warranty-management-production
```

Workflow deploy chuyển vào `DEPLOY_PATH`, rồi luôn gọi Compose với:

```bash
docker compose \
  --env-file .env.production \
  -f docker-compose.prod.yml \
  up -d
```

Vì có `--env-file .env.production`, Docker Compose đọc
`COMPOSE_PROJECT_NAME` từ file này và dùng
`warranty-management-production` làm tên project.

Luồng đọc cấu hình:

```text
/root/warranty-management-production/.env.production
                         ↓
docker compose --env-file .env.production
                         ↓
COMPOSE_PROJECT_NAME=warranty-management-production
                         ↓
Docker Compose project: warranty-management-production
```

Project name tách default network và named volume khỏi
`ecommerce-production`. Docker images vẫn nằm chung trong image store của
Docker daemon, nhưng được phân biệt bằng repository và tag.

Compose production hiện khai báo `container_name` với tiền tố
`warranty-management-base-`. Ecommerce dùng tiền tố `ecommerce-`, nên tên
container của hai stack không trùng nhau.

Các host port mặc định của warranty cũng khác ecommerce:

| Service        |  Ecommerce production | Warranty production |
| -------------- | --------------------: | ------------------: |
| API            |                `3000` |              `4100` |
| Storefront/Web |           qua Traefik |              `4101` |
| Admin          |           qua Traefik |              `4102` |
| PostgreSQL     | `5432` trên localhost |             `25432` |
| Redis          |         không publish |             `16379` |
| MinIO API      |           qua Traefik |             `19000` |
| MinIO Console  | `9001` trên localhost |             `19001` |

Trước khi deploy, vẫn nên kiểm tra port thực tế:

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Không dùng lại `COMPOSE_PROJECT_NAME=ecommerce-production` cho warranty.
Không đổi tên Compose project sau khi warranty đã có dữ liệu production, vì
Compose có thể tạo network và volume mới dưới tên mới.

### Kiểm tra Compose project

Trên VPS:

```bash
cd /root/warranty-management-production
```

Kiểm tra biến trong file môi trường:

```bash
grep '^COMPOSE_PROJECT_NAME=' .env.production
```

Kết quả mong đợi:

```text
COMPOSE_PROJECT_NAME=warranty-management-production
```

Kiểm tra tên project mà Compose đã resolve:

```bash
docker compose \
  --env-file .env.production \
  -f docker-compose.prod.yml \
  config | sed -n 's/^name: //p'
```

Kết quả mong đợi:

```text
warranty-management-production
```

Sau lần deploy đầu tiên, kiểm tra label của container API:

```bash
docker inspect warranty-management-base-api \
  --format '{{ index .Config.Labels "com.docker.compose.project" }}'
```

Kiểm tra toàn bộ Compose project:

```bash
docker compose ls
```

Kết quả sẽ có ba project độc lập:

```text
ecommerce-production
traefik-xivy
warranty-management-production
```

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

Docker images dùng GitHub Container Registry (GHCR) làm registry mặc định:

- `ghcr.io/<owner>/<repo>-api:<commit-sha>`
- `ghcr.io/<owner>/<repo>-web:<commit-sha>`
- `ghcr.io/<owner>/<repo>-admin:<commit-sha>`

Workflow `.github/workflows/publish-images.yml` chạy sau khi workflow `CI` xanh trên `main` hoặc `develop` và build/push image cho API, Web, Admin. Khi chưa có VPS/server, phần này đã đủ để có artifact deploy được.

Mỗi image có một tag commit bất biến và một tag theo nhánh:

| Nhánh     | Tag được push                   |
| --------- | ------------------------------- |
| `main`    | `<commit-sha>` và `main`        |
| `develop` | `<commit-sha>` và `develop`     |
| Thủ công  | `<image_tag>` và tên nhánh chạy |

Build từ `develop` không ghi đè tag `main`. Workflow được trigger bằng
`workflow_run`, nên cấu hình cho `develop` phải tồn tại trên default branch của
repository. Default branch hiện là `develop`, nên chỉ cần commit và push thay
đổi workflow lên `develop`; không cần merge vào `main` trước khi build image.

Khi đã có server, chạy workflow `.github/workflows/deploy.yml` thủ công với input `image_tag`. Server cần có repo hoặc bundle deploy trong `DEPLOY_PATH`, file `.env.production`, Docker, Docker Compose, và quyền pull GHCR image.

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
- `DEPLOY_PATH` (khuyến nghị `/root/warranty-management-production`)
- `DEPLOY_API_HEALTH_URL` (optional)
- `DEPLOY_WEB_URL` (optional)
- `DEPLOY_ADMIN_URL` (optional)

Production `.env.production` cần cấu hình image:

- `COMPOSE_PROJECT_NAME=warranty-management-production`
- `API_IMAGE=ghcr.io/<owner>/<repo>-api`
- `WEB_IMAGE=ghcr.io/<owner>/<repo>-web`
- `ADMIN_IMAGE=ghcr.io/<owner>/<repo>-admin`
- `IMAGE_TAG=<commit-sha>`

Telegram secrets cần cấu hình trong GitHub Actions:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Nếu thiếu hai secret này, notification sẽ tự skip.
