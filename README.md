# Booking System Base

`booking-system-base` là nền tảng monorepo có thể tái sử dụng cho các dự án booking, SaaS, công cụ quản trị nội bộ hoặc các hệ thống sản phẩm cần nhiều ứng dụng chạy chung trong một kho mã nguồn. Repo được xây dựng trên Turborepo, pnpm workspace, NestJS, Next.js, Prisma, PostgreSQL, Redis và Docker Compose.

Mục tiêu của repo là cung cấp một nền tảng đủ chuẩn để clone sang dự án mới mà không bị khóa cứng vào một domain cụ thể. Các module nghiệp vụ nên được thêm theo hướng lát cắt dọc trong `apps/api/src/module`, còn UI và các giao kèo dữ liệu dùng chung nên được đưa vào `packages/*` khi thật sự cần tái sử dụng giữa nhiều app.

## Công Nghệ Sử Dụng

### Ứng Dụng

- **API** (`apps/api`): NestJS, Prisma, PostgreSQL, Redis, BullMQ, kiểm tra sức khỏe hệ thống và cấu trúc module sẵn sàng mở rộng.
- **Web** (`apps/web`): Next.js 16, React 19, TailwindCSS 4, dùng cho giao diện công khai hoặc phía khách hàng.
- **Admin** (`apps/admin`): Next.js 16, React 19, TailwindCSS 4, dùng cho dashboard quản trị nội bộ.

### Package Dùng Chung

- **@repo/shared** (`packages/shared`): kiểu dữ liệu, schema, hằng số, HTTP helper và utility dùng chung.
- **@repo/hooks** (`packages/hooks`): React hooks dùng chung cho admin, web và các client Next.js khác.
- **@repo/ui** (`packages/ui`): các thành phần UI nền tảng có thể tái sử dụng.
- **@repo/telegram** (`packages/telegram`): module gửi thông báo CI/CD qua Telegram, hỗ trợ tin nhắn HTML và ảnh được dựng từ mẫu giao diện.
- **@repo/eslint-config** (`packages/eslint-config`): cấu hình ESLint dùng chung.
- **@repo/typescript-config** (`packages/typescript-config`): cấu hình TypeScript dùng chung.

### Hạ Tầng Và Công Cụ

- **Turborepo**: điều phối tác vụ trong monorepo và cache kết quả build.
- **pnpm**: quản lý gói phụ thuộc theo workspace.
- **Docker Compose**: chạy cụm dịch vụ phát triển và cụm dịch vụ giống sản xuất.
- **Makefile**: gom các lệnh thường dùng thành shortcut ngắn.
- **Husky + lint-staged + Commitlint**: kiểm tra chất lượng trước commit và áp dụng Conventional Commits.
- **GitHub Actions**: quy trình CI có tích hợp thông báo Telegram tùy chọn.

## Cấu Trúc Dự Án

```txt
booking-system-base/
├── apps/
│   ├── api/                 # @repo/api - Backend NestJS
│   ├── web/                 # @repo/web - app Next.js công khai
│   └── admin/               # @repo/admin - app Next.js quản trị
├── packages/
│   ├── shared/              # @repo/shared - giao kèo dữ liệu và utility dùng chung
│   ├── hooks/               # @repo/hooks - React hooks dùng chung
│   ├── ui/                  # @repo/ui - thành phần UI dùng chung
│   ├── telegram/            # @repo/telegram - thông báo CI/CD qua Telegram
│   ├── eslint-config/       # @repo/eslint-config
│   └── typescript-config/   # @repo/typescript-config
├── docs/
│   ├── agents/              # quy trình cho AI agent
│   ├── adr/                 # ghi chú quyết định kiến trúc
│   ├── architecture/        # tổng quan kiến trúc
│   ├── conventions/         # quy ước code và module
│   ├── integrations/        # hướng dẫn tích hợp
│   ├── issues/              # ticket triển khai nội bộ
│   └── prd/                 # tài liệu yêu cầu sản phẩm
├── .github/
│   └── workflows/           # quy trình CI
├── docker-compose.dev.yml   # cụm dev: db, redis, api
├── docker-compose.prod.yml  # cụm giống sản xuất: db, redis, api, worker-email, web, admin
├── Makefile                 # shortcut lệnh
├── pnpm-workspace.yaml      # cấu hình pnpm workspace
└── turbo.json               # cấu hình Turborepo
```

## Kiến Trúc Frontend

Các app Next.js trong `apps/admin` và `apps/web` dùng chung rule folder để dễ tái sử dụng làm boilerplate.

Nguyên tắc chính:

- `app/**/page.tsx` là server component mỏng, chỉ import và render view.
- UI màn hình đặt trong `src/views/<feature>/<feature>.view.tsx`.
- Component riêng của feature đặt trong `src/views/<feature>/components`.
- Component dùng lại trong app đặt trong `src/components/common`.
- Layout shell, sidebar, header đặt trong `src/components/layout`.
- Hook dùng chung nhiều client đặt trong `packages/hooks`.
- Mock data, tab config, filter options đặt trong `*.constants.ts`.
- API/domain type đặt trong `packages/shared/src/types`.
- Type riêng cho view/local UI state đặt trong `*.types.ts`.
- Table columns đặt trong `*.columns.tsx`.
- `index.ts` chỉ dùng để export.

Ví dụ:

```tsx
import { BookingsView } from "@/src/views/bookings/bookings.view";

export default function BookingsPage() {
  return <BookingsView />;
}
```

Chi tiết rule nằm tại `docs/architecture/frontend-folder-structure.md` và `docs/architecture/frontend-shared-hooks.md`.

## Kiến Trúc Backend

API trong `apps/api` dùng NestJS và tổ chức module nghiệp vụ theo Clean Architecture nhẹ.

Luồng phụ thuộc chuẩn:

```txt
controller -> use-case -> repository -> database
                 |
                 -> domain service
                 -> external gateway/job/email service
```

Mỗi module nghiệp vụ nên có cấu trúc:

```txt
src/modules/<module>/
├── <module>.module.ts
├── <module>.controller.ts
├── dto/
├── repository/
├── use-cases/
├── service/
└── tests/
```

Rule chính:

- Controller chỉ nhận HTTP input và gọi use case.
- Use case chứa business flow và là phần ưu tiên unit test.
- Repository chứa data access qua Prisma/database.
- `tests/` trong mỗi module chứa `*.use-case.spec.ts` để test use case bằng mock repository.
- DTO chỉ dùng bởi Nest controller nằm trong `dto/`; type/schema dùng chung Admin/Web/API đặt trong `packages/shared`.

Chi tiết rule nằm tại `docs/architecture/backend-folder-structure.md`.

## Yêu Cầu Môi Trường

- Node.js `>= 20`
- pnpm `9.x`
- Docker và Docker Compose
- Make, không bắt buộc nhưng nên có

Bật pnpm qua Corepack nếu máy chưa có pnpm:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

## Bắt Đầu Nhanh

### 1. Cài Dependency

```bash
pnpm install
```

### 2. Tạo File Môi Trường Local

```bash
cp .env.example .env.development
```

Các port mặc định trong `.env.example` đã được đổi sang dải riêng để hạn chế đụng với dự án khác:

| Dịch vụ    | Biến môi trường | Mặc định |
| :--------- | :-------------- | :------- |
| API        | `API_PORT`      | `4100`   |
| Web        | `WEB_PORT`      | `4101`   |
| Admin      | `ADMIN_PORT`    | `4102`   |
| PostgreSQL | `DEV_DB_PORT`   | `15432`  |
| Redis      | `REDIS_DB_PORT` | `16379`  |

### 3. Chạy Hạ Tầng Phát Triển

Cụm dịch vụ phát triển hiện gồm PostgreSQL, Redis và API:

```bash
pnpm infra:dev:up
```

hoặc dùng Makefile:

```bash
make infra-dev-up
```

### 4. Chuẩn Bị Database

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm db:seed:dev
```

Chỉ nên dùng `db:push:dev` khi cần thử nhanh schema. Với luồng phát triển chuẩn, ưu tiên migration để lịch sử schema rõ ràng.

### 5. Chạy Ứng Dụng

Chạy API, Web và Admin cùng lúc:

```bash
pnpm dev:full
```

Chạy từng ứng dụng riêng:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:admin
```

URL cục bộ mặc định:

- API: `http://localhost:3000`
- Web: `http://localhost:3001`
- Admin: `http://localhost:3002`

## Danh Sách Lệnh

### Lệnh Chung

| Lệnh                      | Mô tả                                   |
| :------------------------ | :-------------------------------------- |
| `pnpm install`            | Cài gói phụ thuộc cho toàn bộ workspace |
| `pnpm dev`                | Chạy toàn bộ tác vụ `dev` qua Turbo     |
| `pnpm dev:full`           | Chạy API, Web và Admin                  |
| `pnpm build`              | Biên dịch toàn bộ monorepo              |
| `pnpm build:packages`     | Biên dịch các package dùng chung        |
| `pnpm lint`               | Kiểm tra lint toàn bộ monorepo          |
| `pnpm lint:packages`      | Kiểm tra lint các package dùng chung    |
| `pnpm check-types`        | Kiểm tra TypeScript toàn bộ monorepo    |
| `pnpm typecheck:packages` | Kiểm tra type các package dùng chung    |
| `pnpm test`               | Chạy test qua Turbo                     |
| `pnpm format`             | Format file bằng Prettier               |

### Lệnh Theo App

| Lệnh                 | Mô tả                               |
| :------------------- | :---------------------------------- |
| `pnpm dev:api`       | Chạy API NestJS ở chế độ watch      |
| `pnpm dev:api:debug` | Chạy API ở chế độ debug watch       |
| `pnpm dev:web`       | Chạy app Web                        |
| `pnpm dev:admin`     | Chạy app Admin                      |
| `pnpm build:api`     | Biên dịch riêng API                 |
| `pnpm build:web`     | Biên dịch riêng Web                 |
| `pnpm build:admin`   | Biên dịch riêng Admin               |
| `pnpm start:api`     | Chạy API đã build ở chế độ sản xuất |
| `pnpm start:web`     | Chạy Web đã build                   |
| `pnpm start:admin`   | Chạy Admin đã build                 |

### Lệnh Test

| Lệnh                  | Mô tả                                   |
| :-------------------- | :-------------------------------------- |
| `pnpm test:api`       | Chạy unit test cho API                  |
| `pnpm test:api:watch` | Chạy test API ở chế độ watch            |
| `pnpm test:api:cov`   | Chạy test API kèm coverage              |
| `pnpm test:api:e2e`   | Chạy e2e test cho API                   |
| `pnpm test:api:dev`   | Chạy test API với môi trường phát triển |
| `pnpm test:api:prod`  | Chạy test API với môi trường sản xuất   |

### Lệnh Database Và Prisma

| Lệnh                       | Mô tả                                        |
| :------------------------- | :------------------------------------------- |
| `pnpm prisma:generate`     | Sinh Prisma Client                           |
| `pnpm prisma:migrate:dev`  | Chạy migration cho môi trường phát triển     |
| `pnpm prisma:migrate:prod` | Triển khai migration cho môi trường sản xuất |
| `pnpm prisma:studio:dev`   | Mở Prisma Studio                             |
| `pnpm db:push:dev`         | Đẩy schema vào database phát triển           |
| `pnpm db:push:test`        | Đẩy schema vào database kiểm thử             |
| `pnpm db:push:prod`        | Đẩy schema vào database sản xuất             |
| `pnpm db:seed:dev`         | Seed database phát triển                     |
| `pnpm db:seed:test`        | Seed database kiểm thử                       |
| `pnpm db:seed:prod`        | Seed database sản xuất                       |
| `pnpm db:reset:dev`        | Reset migration database phát triển          |

### Lệnh Hạ Tầng

| Lệnh                     | Mô tả                                |
| :----------------------- | :----------------------------------- |
| `pnpm infra:dev:up`      | Chạy cụm dev gồm db, redis và api    |
| `pnpm infra:dev:down`    | Dừng cụm dev                         |
| `pnpm infra:dev:logs`    | Xem log cụm dev                      |
| `pnpm infra:dev:ps`      | Xem container đang chạy của cụm dev  |
| `pnpm infra:dev:config`  | Xuất cấu hình compose dev            |
| `pnpm infra:prod:up`     | Chạy cụm giống sản xuất              |
| `pnpm infra:prod:down`   | Dừng cụm giống sản xuất              |
| `pnpm infra:prod:logs`   | Xem log cụm giống sản xuất           |
| `pnpm infra:prod:ps`     | Xem container của cụm giống sản xuất |
| `pnpm infra:prod:config` | Xuất cấu hình compose giống sản xuất |

### Lệnh Docker

| Lệnh                      | Mô tả                         |
| :------------------------ | :---------------------------- |
| `pnpm docker:build:api`   | Tạo Docker image cho API      |
| `pnpm docker:build:web`   | Tạo Docker image cho Web      |
| `pnpm docker:build:admin` | Tạo Docker image cho Admin    |
| `pnpm docker:build:all`   | Tạo toàn bộ image app         |
| `pnpm docker:check:api`   | Kiểm tra Dockerfile của API   |
| `pnpm docker:check:web`   | Kiểm tra Dockerfile của Web   |
| `pnpm docker:check:admin` | Kiểm tra Dockerfile của Admin |
| `pnpm docker:check:all`   | Kiểm tra toàn bộ Dockerfile   |

### Shortcut Makefile

Các lệnh quan trọng đã có alias trong `Makefile`:

```bash
make help
make install
make dev-full
make build
make build-packages
make lint
make lint-packages
make check-types
make typecheck-packages
make test
make infra-dev-up
make infra-prod-up
make docker-build-all
make docker-check-all
make prisma-migrate-dev
make db-seed-dev
```

## Docker Compose

### Cụm Dịch Vụ Phát Triển

`docker-compose.dev.yml` gồm:

- `db`: PostgreSQL 16
- `redis`: Redis 7
- `api`: container API NestJS chạy môi trường phát triển

Service `api` mount mã nguồn của repo vào `/app` và mount `./storage:/app/storage` để lưu file upload hoặc asset cục bộ trong quá trình phát triển.

```bash
pnpm infra:dev:up
pnpm infra:dev:logs
pnpm infra:dev:down
```

### Cụm Dịch Vụ Giống Sản Xuất

`docker-compose.prod.yml` gồm:

- `db`
- `redis`
- `api`
- `worker-email`
- `web`
- `admin`

Compose giống sản xuất dùng Docker image, không mount mã nguồn:

```bash
API_IMAGE=booking-api WEB_IMAGE=booking-web ADMIN_IMAGE=booking-admin IMAGE_TAG=latest \
pnpm infra:prod:up
```

Migration Prisma nên được chạy bằng lệnh riêng:

```bash
pnpm prisma:migrate:prod
```

Không nên tự chạy migration khi ứng dụng khởi động.

## Biến Môi Trường

Sao chép `.env.example` thành `.env.development` cho môi trường cục bộ. Với môi trường sản xuất, tạo `.env.production` và thay bằng secret, domain, database, Redis thật.

Các nhóm biến quan trọng:

- **API**: `API_PORT`, `APP_NAME`, `APP_VERSION`, `BACKEND_URL`, `PUBLIC_API_URL`
- **Auth**: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_SECRET`, `BCRYPT_ROUNDS`
- **Database**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`
- **Redis**: `REDIS_HOST`, `REDIS_DEV_PORT`, `REDIS_PASSWORD`, `REDIS_URL`
- **Storage**: `STORAGE_DRIVER`, `STORAGE_ROOT_DIR`, `ASSET_CDN_URL`
- **Web/Admin**: `WEB_PORT`, `ADMIN_PORT`, `NEXT_PUBLIC_API_URL`
- **Telegram CI/CD**: `CI_TELEGRAM_BOT_TOKEN`, `CI_TELEGRAM_CHAT_ID`

Không commit `.env.development`, `.env.production` hoặc bất kỳ file nào chứa secret thật.

## Thông Báo Telegram Cho CI/CD

Repo có sẵn module gửi thông báo Telegram tại `packages/telegram`.

Giá trị bí mật bắt buộc:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Hai giá trị này nên được cấu hình trong phần secret của repository trên GitHub Actions.

Chạy thử mà không gửi thật:

```bash
pnpm notify:telegram \
  --dry-run \
  --mode text \
  --event ci \
  --status success \
  --project booking-system-base \
  --repository owner/repo \
  --branch main \
  --commit abc123 \
  --message "ci: verify monorepo" \
  --author trh-thanh30 \
  --workflow CI \
  --job verify \
  --passed 1
```

Các chế độ hỗ trợ:

- `text`: gửi tin nhắn HTML qua Telegram.
- `image`: dựng card thành ảnh PNG rồi gửi dưới dạng ảnh.
- `both`: gửi cả tin nhắn HTML và ảnh.

Xem thêm tại `docs/integrations/telegram.md`.

## CI

Quy trình GitHub Actions hiện có:

| Quy trình | Kích hoạt                       | Công việc                                                                                  |
| :-------- | :------------------------------ | :----------------------------------------------------------------------------------------- |
| `CI`      | Pull request và push vào `main` | tách job Packages, API, Web, Admin; chạy lint, typecheck, test/build phù hợp; gửi Telegram |

Thông báo Telegram sẽ tự bỏ qua nếu chưa cấu hình đủ `CI_TELEGRAM_BOT_TOKEN` và `CI_TELEGRAM_CHAT_ID`.

## Quy Ước Kiến Trúc

### Module API

Các tính năng backend nên nằm trong `apps/api/src/module/<feature>`. Ưu tiên lát cắt dọc để controller, DTO, service/use-case, repository và test nằm gần cùng một ranh giới module.

Các khu vực API có sẵn:

- `auth`
- `user`
- `assets`
- `notification`
- `email`
- `health`
- `jobs`
- `verification`

Đọc `docs/conventions/modules.md` trước khi thêm module lớn.

### Code Dùng Chung

Chỉ đưa code vào shared package khi thật sự có nhu cầu dùng chung giữa nhiều ranh giới:

- Dùng `@repo/shared` cho giao kèo dữ liệu, schema, hằng số và utility thuần.
- Dùng `@repo/hooks` cho React hooks dùng chung giữa Web/Admin.
- Dùng `@repo/ui` cho thành phần UI React nền tảng có thể tái sử dụng.
- Giữ logic riêng của app trong chính app đó nếu chưa có trường hợp dùng chung rõ ràng.

### Quy Ước Import

Import nội bộ trong app nên ưu tiên alias đã cấu hình thay vì relative import quá sâu. Shared package nên được import bằng tên package:

```ts
import { something } from "@/module/example";
import { ApiResponse } from "@repo/shared";
```

## Quy Trình Cho AI Agent

Repo có quy trình nhẹ cho AI agent, lấy cảm hứng từ AI Hero skills, để giữ quá trình triển khai rõ ràng, có tài liệu và dễ bàn giao.

Luồng mặc định:

1. Dùng `docs/agents/workflows/01-grill-with-docs.md` cho công việc chưa rõ hoặc có ảnh hưởng lớn.
2. Viết PRD trong `docs/prd/`.
3. Tách PRD thành các issue dọc trong `docs/issues/`.
4. Dùng hướng dẫn TDD cho phần logic rủi ro.
5. Dùng quy trình chẩn đoán và review kiến trúc khi debug regression hoặc refactor lớn.
6. Tạo tài liệu bàn giao trước khi chuyển ngữ cảnh hoặc dừng giữa chừng.

Bộ nhớ của repo:

- `CONTEXT.md`: ngôn ngữ chung và các quyết định kiến trúc.
- `docs/adr/`: các quyết định kiến trúc đã chấp nhận.
- `docs/prd/`: tài liệu yêu cầu sản phẩm.
- `docs/issues/`: ticket triển khai nội bộ.

Đọc `AGENTS.md` trước khi lên kế hoạch hoặc triển khai thay đổi lớn.

## Quy Ước Git

Repo dùng Conventional Commits với Commitlint.

Định dạng:

```txt
<type>: <subject>
```

Các loại commit thường dùng:

| Type       | Ý nghĩa                             |
| :--------- | :---------------------------------- |
| `feat`     | Thêm tính năng mới                  |
| `fix`      | Sửa lỗi                             |
| `docs`     | Thay đổi tài liệu                   |
| `refactor` | Tái cấu trúc code không đổi hành vi |
| `test`     | Thêm hoặc sửa test                  |
| `ci`       | Thay đổi CI/CD                      |
| `chore`    | Công việc bảo trì                   |

Ví dụ:

```bash
git commit -m "feat: add booking availability module"
git commit -m "fix: correct redis health check"
git commit -m "docs: update docker compose guide"
```

## Tái Sử Dụng Base Cho Dự Án Mới

Danh sách kiểm tra khuyến nghị:

1. Đổi metadata trong `package.json`.
2. Cập nhật `APP_NAME`, port, tên database và giá trị secret mẫu trong `.env.example`.
3. Cập nhật tên Docker image trong script và compose env.
4. Thay UI mẫu trong `apps/web` và `apps/admin`.
5. Thêm module nghiệp vụ dưới `apps/api/src/module`.
6. Tạo hoặc cập nhật PRD trong `docs/prd`.
7. Tạo ADR cho các quyết định kiến trúc quan trọng.
8. Cấu hình GitHub Actions secrets cho Telegram nếu cần thông báo CI/CD.
9. Chạy `pnpm lint`, `pnpm check-types`, `pnpm test:api` và `pnpm build`.

## Liên Kết Hữu Ích

- `AGENTS.md` - điểm bắt đầu cho quy trình AI agent.
- `CONTEXT.md` - context và quyết định chung của repo.
- `docs/architecture/overview.md` - tổng quan kiến trúc.
- `docs/getting-started.md` - hướng dẫn chạy repo lần đầu.
- `docs/development.md` - workflow phát triển.
- `docs/testing.md` - chiến lược test.
- `docs/deployment.md` - build/deploy/CI.
- `docs/env.md` - quy ước biến môi trường.
- `docs/conventions/modules.md` - quy ước tổ chức module.
- `docs/integrations/telegram.md` - hướng dẫn thông báo Telegram.
- `docker-compose.dev.yml` - hạ tầng phát triển.
- `docker-compose.prod.yml` - hạ tầng giống sản xuất.
