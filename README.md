# Warranty Management Automotive Demo

Repo này là nền tảng monorepo đang được chuẩn bị để triển khai demo hệ thống quản lý bảo hành, tập trung trước vào ô tô, phụ kiện, phụ tùng và các gói dịch vụ liên quan đến ô tô.

Dự án được khởi tạo từ một base booking/SaaS có sẵn, nhưng ngữ cảnh triển khai hiện tại đã chuyển sang bài toán bảo hành: admin quản lý sản phẩm, gán sản phẩm cho khách hàng, kích hoạt bảo hành và cho phép khách hàng đăng nhập để tra cứu đúng các sản phẩm thuộc quyền sở hữu của mình.

Tài liệu PRD chính:

- [docs/prd/warranty-management-automotive-demo.md](docs/prd/warranty-management-automotive-demo.md)
- [docs/prd/warranty-management-automotive-demo.docx](docs/prd/warranty-management-automotive-demo.docx)

## Mục Tiêu Demo

MVP demo cần chứng minh được luồng nghiệp vụ cốt lõi:

1. Admin tạo, sửa, xóa mềm và xem danh sách sản phẩm.
2. Mỗi sản phẩm có mã tra cứu bảo hành duy nhất, ví dụ `warrantyCode` hoặc `serialNumber`.
3. Mã tra cứu có thể tự sinh hoặc do admin nhập thủ công khi sản phẩm đã có VIN/serial/mã nhà sản xuất.
4. Admin gán sản phẩm cho khách hàng mua sản phẩm.
5. Khách hàng đăng nhập vào web và chỉ xem được sản phẩm thuộc về mình.
6. Khách hàng tra cứu sản phẩm bằng mã, nhưng API phải kiểm tra quan hệ sở hữu trước khi trả kết quả.
7. Trang chi tiết bảo hành hiển thị sản phẩm, ngày mua/ngày kích hoạt, thời hạn và trạng thái bảo hành.

Rule quan trọng nhất của demo: **mã bảo hành không phải cơ chế bảo mật duy nhất; backend use case phải enforce quyền truy cập theo customer ownership.**

## Phạm Vi Demo Đầu Tiên

Demo đầu tiên tập trung vào:

- Quản lý khách hàng.
- Quản lý sản phẩm được bảo hành.
- Gán ownership giữa sản phẩm và khách hàng.
- Kích hoạt và tra cứu bảo hành.
- Admin dashboard cơ bản.
- Customer web cơ bản cho danh sách sản phẩm, tra cứu và chi tiết bảo hành.
- Seed dữ liệu mẫu để trình bày luồng thành công và luồng bị từ chối khi tra cứu sản phẩm của người khác.

Chưa ưu tiên trong demo đầu tiên:

- Thanh toán.
- Tích hợp nhà sản xuất, đại lý ngoài hoặc DMS.
- Quản lý tồn kho chi tiết.
- Ký số/chứng thư bảo hành.
- Lịch hẹn sửa chữa phức tạp.
- Mobile native app.
- Phân quyền đa tenant phức tạp.

## Công Nghệ Sử Dụng

### Ứng Dụng

- **API** (`apps/api`): NestJS, Prisma, PostgreSQL, Redis, BullMQ, health check và module backend theo Clean Architecture nhẹ.
- **Web** (`apps/web`): Next.js 16, React 19, TailwindCSS 4, dùng cho trải nghiệm khách hàng.
- **Admin** (`apps/admin`): Next.js 16, React 19, TailwindCSS 4, dùng cho dashboard quản trị.
- **Docs** (`apps/docs`): static HTML + TailwindCSS + markdown renderer, dùng để frontend đọc tài liệu module qua port cục bộ.

### Package Dùng Chung

- **@repo/shared** (`packages/shared`): type, schema, hằng số, HTTP helper và utility dùng chung.
- **@repo/hooks** (`packages/hooks`): React hooks dùng chung cho Web/Admin.
- **@repo/ui** (`packages/ui`): thành phần UI nền tảng có thể tái sử dụng.
- **@repo/telegram** (`packages/telegram`): module gửi thông báo CI/CD qua Telegram.
- **@repo/eslint-config** (`packages/eslint-config`): cấu hình ESLint dùng chung.
- **@repo/typescript-config** (`packages/typescript-config`): cấu hình TypeScript dùng chung.

### Hạ Tầng Và Công Cụ

- **Turborepo**: điều phối tác vụ trong monorepo và cache build.
- **pnpm workspace**: quản lý dependency theo workspace.
- **Docker Compose**: chạy PostgreSQL, Redis và các app.
- **Prisma**: schema, migration, seed và database client.
- **Husky + lint-staged + Commitlint**: kiểm tra chất lượng trước commit.
- **GitHub Actions**: CI cho Packages, API, Web, Admin và thông báo Telegram tùy chọn.

## Cấu Trúc Dự Án

```txt
warranty-management-base/
├── apps/
│   ├── api/                 # @repo/api - Backend NestJS
│   ├── web/                 # @repo/web - app khách hàng
│   ├── admin/               # @repo/admin - dashboard quản trị
│   └── docs/                # @repo/docs - static module docs
├── packages/
│   ├── shared/              # @repo/shared - giao kèo dữ liệu và utility dùng chung
│   ├── hooks/               # @repo/hooks - React hooks dùng chung
│   ├── ui/                  # @repo/ui - thành phần UI dùng chung
│   ├── telegram/            # @repo/telegram - thông báo CI/CD qua Telegram
│   ├── eslint-config/       # @repo/eslint-config
│   └── typescript-config/   # @repo/typescript-config
├── docs/
│   ├── agents/              # quy trình cho AI agent
│   ├── adr/                 # quyết định kiến trúc
│   ├── architecture/        # hướng dẫn frontend/backend folder structure
│   ├── issues/              # ticket triển khai nội bộ
│   └── prd/                 # tài liệu yêu cầu sản phẩm
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Makefile
├── pnpm-workspace.yaml
└── turbo.json
```

## Domain Chính

Các module nghiệp vụ cần ưu tiên cho demo:

- **auth/users**: đăng nhập admin và khách hàng, guard theo role.
- **customers**: hồ sơ khách hàng mua sản phẩm.
- **products**: sản phẩm được bảo hành, mã nội bộ, mã bảo hành, VIN/serial, trạng thái.
- **product_ownerships**: quan hệ sở hữu hiện tại và lịch sử chuyển chủ.
- **warranties**: thông tin bảo hành, ngày bắt đầu/kết thúc, trạng thái.
- **warranty_claims**: chuẩn bị sau demo cho yêu cầu bảo hành/sửa chữa.

Mã tra cứu đề xuất:

```txt
WM-YYYY-XXXXXX
```

Ví dụ:

```txt
WM-2026-8F3K2A
```

## Kiến Trúc Backend

API trong `apps/api` dùng NestJS và tổ chức module nghiệp vụ theo luồng:

```txt
controller -> use case -> repository -> database
```

Module nghiệp vụ nên có cấu trúc:

```txt
apps/api/src/modules/<module>/
├── <module>.module.ts
├── <module>.controller.ts
├── dto/
├── repository/
├── use-cases/
└── tests/
```

Rule chính:

- Controller chỉ nhận HTTP input và gọi use case.
- Use case chứa business flow và là phần ưu tiên unit test.
- Repository chứa data access qua Prisma/database.
- `tests/` trong mỗi module chứa `*.use-case.spec.ts`, dùng mock repository.
- API/domain contracts dùng chung Admin/Web đặt trong `packages/shared`.
- Nest-only DTO nằm trong module `dto/`.

Module demo đề xuất:

```txt
apps/api/src/modules/customers/
apps/api/src/modules/products/
apps/api/src/modules/warranties/
```

Chi tiết rule nằm tại [docs/architecture/backend-folder-structure.md](docs/architecture/backend-folder-structure.md).

## Kiến Trúc Frontend

Các app Next.js trong `apps/admin` và `apps/web` phải giữ `app/**/page.tsx` là server component mỏng, chỉ import và render view từ `src/views`.

Rule chính:

- View màn hình đặt trong `src/views/<feature>/<feature>.view.tsx`.
- Component riêng của feature đặt trong `src/views/<feature>/components`.
- Component dùng lại trong app đặt trong `src/components/common`.
- Layout shell, sidebar, header đặt trong `src/components/layout`.
- Mock data, tab config, filter options đặt trong `*.constants.ts`.
- Type API/domain dùng chung đặt trong `packages/shared/src/types`.
- Type riêng cho view/local UI state đặt trong `*.types.ts`.
- Table columns đặt trong `*.columns.tsx`.
- Không thêm `"use client"` vào `app/**/page.tsx`.

Màn hình demo Admin:

- `Products List`: danh sách, tìm kiếm theo mã/tên/VIN/khách hàng, filter theo category/status/warranty status.
- `Create/Edit Product`: form sản phẩm, toggle tự sinh mã/nhập thủ công, chọn khách hàng, cấu hình bảo hành.
- `Product Detail`: sản phẩm, owner, bảo hành, hành động sửa/xóa mềm/kích hoạt.
- `Customers`: danh sách khách hàng và sản phẩm đang sở hữu.

Màn hình demo Web:

- `My Products`: danh sách sản phẩm khách đang sở hữu.
- `Warranty Lookup`: nhập mã tra cứu và hiển thị kết quả hợp lệ.
- `Warranty Detail`: thông tin sản phẩm, mã bảo hành, ngày bắt đầu/kết thúc, trạng thái.

Chi tiết rule nằm tại [docs/architecture/frontend-folder-structure.md](docs/architecture/frontend-folder-structure.md) và [docs/architecture/frontend-shared-hooks.md](docs/architecture/frontend-shared-hooks.md).

## Bắt Đầu Nhanh

### 1. Yêu Cầu Môi Trường

- Node.js `>= 20`
- pnpm `9.x`
- Docker và Docker Compose
- Make, không bắt buộc nhưng khuyến nghị dùng

Bật pnpm qua Corepack nếu máy chưa có pnpm:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

### 2. Cài Dependency

```bash
pnpm install
```

### 3. Tạo File Môi Trường Local

```bash
cp .env.example .env.development
```

Các port mặc định:

| Dịch vụ    | Biến môi trường | Mặc định |
| :--------- | :-------------- | :------- |
| API        | `API_PORT`      | `4100`   |
| Web        | `WEB_PORT`      | `4101`   |
| Admin      | `ADMIN_PORT`    | `4102`   |
| Docs       | `DOCS_PORT`     | `8080`   |
| PostgreSQL | `DEV_DB_PORT`   | `15432`  |
| Redis      | `REDIS_DB_PORT` | `16379`  |
| MinIO      | `MINIO_PORT`    | `19000`  |

Không commit `.env.development`, `.env.production` hoặc secret thật.

### 4. Chạy Hạ Tầng Phát Triển

```bash
pnpm infra:dev:up
```

hoặc:

```bash
make infra-dev-up
```

### 5. Chuẩn Bị Database

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm db:seed:dev
```

Chỉ dùng `pnpm db:push:dev` khi cần thử nhanh schema. Luồng chuẩn nên dùng migration để lịch sử schema rõ ràng.

### 6. Chạy Ứng Dụng

Chạy API, Web và Admin cùng lúc:

```bash
pnpm dev:full
```

Chạy từng ứng dụng riêng:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:admin
pnpm dev:docs
```

URL cục bộ mặc định:

- API: `http://localhost:4100`
- Web: `http://localhost:4101`
- Admin: `http://localhost:4102`
- Docs: `http://127.0.0.1:8080`

### 7. Chạy Module Docs

Docs app là static page nhẹ để render các file markdown trong `apps/docs/public/content`.

Chạy từ root repo:

```bash
pnpm dev:docs
```

Mở:

```txt
http://127.0.0.1:8080
```

Nếu port `8080` đang bận, đổi port bằng biến môi trường:

```bash
DOCS_PORT=8081 pnpm dev:docs
```

Kiểm tra cấu hình docs trước khi commit:

```bash
pnpm build:docs
```

Thêm docs module mới:

1. Tạo file `.md` trong `apps/docs/public/content`.
2. Thêm item mới vào `apps/docs/public/content/modules.json`.
3. Chạy `pnpm build:docs` để kiểm tra file được khai báo hợp lệ.

## Lệnh Thường Dùng

### Lệnh Chung

| Lệnh                      | Mô tả                                |
| :------------------------ | :----------------------------------- |
| `pnpm install`            | Cài dependency cho toàn bộ workspace |
| `pnpm dev`                | Chạy toàn bộ tác vụ `dev` qua Turbo  |
| `pnpm dev:full`           | Chạy API, Web và Admin               |
| `pnpm build`              | Build toàn bộ monorepo               |
| `pnpm build:packages`     | Build các package dùng chung         |
| `pnpm lint`               | Kiểm tra lint toàn bộ monorepo       |
| `pnpm lint:packages`      | Kiểm tra lint các package dùng chung |
| `pnpm check-types`        | Kiểm tra TypeScript toàn bộ monorepo |
| `pnpm typecheck:packages` | Kiểm tra type các package dùng chung |
| `pnpm test`               | Chạy test qua Turbo                  |
| `pnpm format`             | Format file bằng Prettier            |

### Lệnh Theo App

| Lệnh                 | Mô tả                               |
| :------------------- | :---------------------------------- |
| `pnpm dev:api`       | Chạy API NestJS ở chế độ watch      |
| `pnpm dev:api:debug` | Chạy API ở chế độ debug watch       |
| `pnpm dev:web`       | Chạy app Web                        |
| `pnpm dev:admin`     | Chạy app Admin                      |
| `pnpm dev:docs`      | Chạy static module docs ở port 8080 |
| `pnpm build:api`     | Build riêng API                     |
| `pnpm build:web`     | Build riêng Web                     |
| `pnpm build:admin`   | Build riêng Admin                   |
| `pnpm build:docs`    | Kiểm tra static docs và modules     |
| `pnpm start:api`     | Chạy API đã build ở chế độ sản xuất |
| `pnpm start:web`     | Chạy Web đã build                   |
| `pnpm start:admin`   | Chạy Admin đã build                 |
| `pnpm start:docs`    | Chạy static docs server             |

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

Service `api` mount mã nguồn vào `/app` và mount `./storage:/app/storage` để lưu file upload hoặc asset cục bộ.

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
API_IMAGE=warranty-management-base-api WEB_IMAGE=warranty-management-base-web ADMIN_IMAGE=warranty-management-base-admin IMAGE_TAG=latest \
pnpm infra:prod:up
```

Migration Prisma nên chạy bằng lệnh riêng:

```bash
pnpm prisma:migrate:prod
```

Không chạy migration tự động khi ứng dụng khởi động.

## Biến Môi Trường

Sao chép `.env.example` thành `.env.development` cho môi trường cục bộ. Với môi trường sản xuất, tạo `.env.production` và thay bằng secret/domain/database/Redis thật.

Các nhóm biến quan trọng:

- **API**: `API_PORT`, `APP_NAME`, `APP_VERSION`, `BACKEND_URL`, `PUBLIC_API_URL`
- **Auth**: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_SECRET`, `BCRYPT_ROUNDS`
- **Database**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`
- **Redis**: `REDIS_HOST`, `REDIS_DEV_PORT`, `REDIS_PASSWORD`, `REDIS_URL`
- **Storage**: `STORAGE_DRIVER`, `STORAGE_ROOT_DIR`, `ASSET_CDN_URL`
- **Web/Admin/Docs**: `WEB_PORT`, `ADMIN_PORT`, `DOCS_PORT`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEB_URL`
- **Telegram CI/CD**: `CI_TELEGRAM_BOT_TOKEN`, `CI_TELEGRAM_CHAT_ID`

## CI/CD Và Telegram

Repo có sẵn module gửi thông báo Telegram tại `packages/telegram`.

Secrets tùy chọn cho GitHub Actions:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

Nếu thiếu hai secret này, notification sẽ tự skip.

Chạy thử mà không gửi thật:

```bash
pnpm notify:telegram \
  --dry-run \
  --mode text \
  --event ci \
  --status success \
  --project warranty-management-base \
  --repository owner/repo \
  --branch main \
  --commit abc123 \
  --message "ci: verify monorepo" \
  --author trh-thanh30 \
  --workflow CI \
  --job verify \
  --passed 1
```

Xem thêm tại [docs/integrations/telegram.md](docs/integrations/telegram.md).

## Kế Hoạch Triển Khai Demo

### Giai Đoạn 1: Nền Tảng Dữ Liệu Và API

1. Thêm schema Prisma cho `customers`, `products`, `product_ownerships`, `warranties`.
2. Tạo module `customers`.
3. Tạo module `products`.
4. Tạo module `warranties`.
5. Viết use-case test cho các rule quan trọng:
   - Tạo mã tự động không trùng.
   - Admin nhập mã bị trùng thì fail.
   - Customer không tra cứu được sản phẩm của người khác.

### Giai Đoạn 2: Admin Demo

1. Tạo trang danh sách sản phẩm.
2. Tạo form thêm/sửa sản phẩm.
3. Gán sản phẩm với khách hàng.
4. Hiển thị chi tiết sản phẩm và bảo hành.

### Giai Đoạn 3: Customer Demo

1. Tạo trang danh sách sản phẩm của tôi.
2. Tạo trang tra cứu bảo hành.
3. Hiển thị trang chi tiết bảo hành.
4. Demo case thành công và case bị từ chối do không phải chủ sở hữu.

### Giai Đoạn 4: Dữ Liệu Mẫu

Seed tối thiểu:

- 1 admin.
- 2 khách hàng.
- 3 sản phẩm:
  - 1 xe gán cho khách A.
  - 1 phụ kiện gán cho khách A.
  - 1 xe gán cho khách B.
- Demo khách A tra cứu sản phẩm của A thành công.
- Demo khách A tra cứu mã của khách B bị từ chối.

## Quy Trình Cho AI Agent

Repo có workflow nhẹ cho AI agent để giữ quá trình triển khai rõ ràng, có tài liệu và dễ bàn giao.

Luồng mặc định:

1. Dùng [docs/agents/workflows/01-grill-with-docs.md](docs/agents/workflows/01-grill-with-docs.md) cho công việc chưa rõ hoặc có ảnh hưởng lớn.
2. Viết PRD trong `docs/prd/`.
3. Tách PRD thành issue dọc trong `docs/issues/`.
4. Dùng hướng dẫn TDD cho logic rủi ro.
5. Dùng quy trình diagnose/review architecture khi debug regression hoặc refactor lớn.
6. Tạo handoff trước khi chuyển ngữ cảnh hoặc dừng giữa chừng.

Bộ nhớ của repo:

- [CONTEXT.md](CONTEXT.md): ngôn ngữ chung và nguyên tắc kiến trúc.
- [docs/adr/](docs/adr/): quyết định kiến trúc đã chấp nhận.
- [docs/prd/](docs/prd/): tài liệu yêu cầu sản phẩm.
- [docs/issues/](docs/issues/): ticket triển khai nội bộ.

Đọc [AGENTS.md](AGENTS.md) trước khi lên kế hoạch hoặc triển khai thay đổi lớn.

## Quy Ước Git

Repo dùng Conventional Commits với Commitlint.

Định dạng:

```txt
<type>: <subject>
```

Các type thường dùng:

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
git commit -m "feat: add warranty lookup module"
git commit -m "fix: enforce customer ownership on warranty lookup"
git commit -m "docs: update automotive warranty demo readme"
```

## Bản Quyền Và Cấp Phép

Copyright © 2026 Trần Hữu Thành. Bảo lưu mọi quyền.

Đây là phần mềm độc quyền. Việc truy cập hoặc xem repository này không cấp
quyền sao chép, sửa đổi, phân phối, cấp phép lại hoặc khai thác thương mại mã
nguồn và các tài liệu thuộc sở hữu của Trần Hữu Thành.

Các thành phần bên thứ ba vẫn tuân theo giấy phép và thông báo bản quyền riêng
của từng thành phần. Xem [LICENSE](LICENSE) và [NOTICE](NOTICE) để biết chi
tiết. Liên hệ cấp phép: [tranhuuthanhcp@gmail.com](mailto:tranhuuthanhcp@gmail.com).

## Liên Kết Hữu Ích

- [AGENTS.md](AGENTS.md) - điểm bắt đầu cho quy trình AI agent.
- [CONTEXT.md](CONTEXT.md) - context và nguyên tắc kiến trúc chung.
- [docs/prd/warranty-management-automotive-demo.md](docs/prd/warranty-management-automotive-demo.md) - PRD demo bảo hành ô tô.
- [docs/architecture/overview.md](docs/architecture/overview.md) - tổng quan kiến trúc.
- [docs/architecture/frontend-folder-structure.md](docs/architecture/frontend-folder-structure.md) - rule frontend.
- [docs/architecture/backend-folder-structure.md](docs/architecture/backend-folder-structure.md) - rule backend.
- [docs/getting-started.md](docs/getting-started.md) - hướng dẫn chạy repo lần đầu.
- [docs/development.md](docs/development.md) - workflow phát triển.
- [docs/testing.md](docs/testing.md) - chiến lược test.
- [docs/deployment.md](docs/deployment.md) - build/deploy/CI.
- [docs/env.md](docs/env.md) - quy ước biến môi trường.
- [docs/integrations/telegram.md](docs/integrations/telegram.md) - thông báo Telegram.
