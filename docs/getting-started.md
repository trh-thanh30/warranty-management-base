# Getting Started

Tài liệu này dùng cho người mới clone repo hoặc khi dùng repo này làm base cho dự án khác.

## Yêu Cầu

- Node.js `>= 20`
- pnpm `9.x`
- Docker và Docker Compose
- Make, không bắt buộc nhưng khuyến nghị dùng

## Cài Đặt

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install
```

## Cấu Hình Môi Trường

```bash
cp .env.example .env.development
```

Sau đó kiểm tra các nhóm biến chính:

- Database: `DATABASE_URL`, `DEV_DB_PORT`
- Redis: `REDIS_URL`, `REDIS_DB_PORT`
- App ports: `API_PORT`, `WEB_PORT`, `ADMIN_PORT`
- Telegram CI: `CI_TELEGRAM_BOT_TOKEN`, `CI_TELEGRAM_CHAT_ID`

Không commit file `.env.development`, `.env.production` hoặc secret thật.

## Chạy Lần Đầu

```bash
pnpm infra:dev:up
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm db:seed:dev
pnpm dev:full
```

URL mặc định:

- API: `http://localhost:${API_PORT:-3000}`
- Web: `http://localhost:${WEB_PORT:-3001}`
- Admin: `http://localhost:${ADMIN_PORT:-3002}`

## Kiểm Tra Repo

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Khi chỉ làm frontend:

```bash
pnpm lint:web
pnpm typecheck:web
pnpm lint:admin
pnpm typecheck:admin
```

Khi chỉ làm package dùng chung:

```bash
pnpm lint:packages
pnpm typecheck:packages
pnpm build:packages
```
