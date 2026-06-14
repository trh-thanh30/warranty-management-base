# Development Workflow

Tài liệu này mô tả workflow phát triển chuẩn cho repo base.

## Nguyên Tắc Chung

- Giữ app-specific code trong `apps/*`.
- Giữ reusable code trong `packages/*`.
- Không import chéo giữa các app.
- Không đặt React hook trong `packages/shared`; dùng `packages/hooks`.
- Không viết logic trong `index.ts`; `index.ts` chỉ export.
- Không auto-fix trong CI. Dùng lệnh `lint:fix` ở local nếu cần.

## Lệnh Thường Dùng

```bash
pnpm dev:full
pnpm dev:api
pnpm dev:web
pnpm dev:admin
```

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## Tạo Frontend Route Mới

1. Tạo route trong `apps/<client>/app`.
2. Tạo view trong `apps/<client>/src/views/<feature>/<feature>.view.tsx`.
3. `page.tsx` chỉ import và render view.
4. Component private đặt trong `src/views/<feature>/components`.
5. Type API/domain đặt trong `packages/shared/src/types`.
6. Type local UI state đặt trong `<feature>.types.ts`.

Xem chi tiết tại `docs/architecture/frontend-route-template.md`.

## Tạo Backend Module Mới

Module backend đi theo Clean Architecture nhẹ:

```txt
controller -> use-case -> repository -> database
```

Mỗi module nên có:

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

Use case là nơi ưu tiên unit test. Repository được mock trong unit test, không gọi database thật.

Xem chi tiết tại `docs/architecture/backend-folder-structure.md`.

## Khi Nào Đưa Code Vào Package?

| Tình huống                        | Nơi đặt                                            |
| :-------------------------------- | :------------------------------------------------- |
| Chỉ dùng trong một app            | `apps/<app>/src/*`                                 |
| Dùng chung Web và Admin           | `packages/ui`, `packages/hooks`, `packages/shared` |
| Là DTO/API response/domain type   | `packages/shared/src/types`                        |
| Là React hook dùng chung          | `packages/hooks`                                   |
| Là UI primitive không chứa domain | `packages/ui`                                      |
| Là integration độc lập            | `packages/<integration>`                           |

## Commit

Repo dùng Commitlint với Conventional Commits.

Ví dụ:

```bash
git commit -m "feat(admin): add booking list view"
git commit -m "fix(api): validate refresh token session"
git commit -m "docs: update deployment guide"
```
