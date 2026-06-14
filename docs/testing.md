# Testing Strategy

Repo ưu tiên test theo rủi ro và boundary.

## API

API dùng Jest.

Lệnh:

```bash
pnpm test:api
pnpm test:api:watch
pnpm test:api:cov
pnpm test:api:e2e
```

Quy ước:

- Unit test use case đặt trong `apps/api/src/modules/<module>/tests`.
- File test đặt theo dạng `<action>.use-case.spec.ts`.
- Repository/database được mock trong unit test.
- E2E test dùng riêng `apps/api/test`.

## Frontend

Hiện tại frontend base ưu tiên:

- Typecheck để bắt lỗi contract.
- Lint để giữ rule React/Next.js.
- Build để bắt lỗi route, server/client boundary và production compile.

Khi dự án thật cần test UI, có thể thêm Vitest + Testing Library hoặc Playwright tùy mức rủi ro.

## Packages

Package dùng chung phải pass:

```bash
pnpm lint:packages
pnpm typecheck:packages
pnpm build:packages
```

Rule:

- `packages/shared` không phụ thuộc React.
- `packages/hooks` phụ thuộc React nhưng không chứa UI component.
- `packages/ui` chứa UI primitive, không chứa domain-specific wording.

## CI Verification

CI tách job theo boundary:

- Packages
- API
- Web
- Admin

Mỗi job chạy lint/typecheck/build phù hợp. API chạy thêm unit test.
