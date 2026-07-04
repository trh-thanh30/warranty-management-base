# Frontend Guide

Checklist này giúp FE triển khai module theo đúng kiến trúc repo.

## Chạy docs module

Từ root repo:

```bash
pnpm dev:docs
```

Mở:

```txt
http://127.0.0.1:8080
```

Nếu port `8080` bận:

```bash
DOCS_PORT=8081 pnpm dev:docs
```

## Khi thêm màn hình

- `app/**/page.tsx` chỉ import và render view.
- View chính đặt trong `src/views/<feature>/<feature>.view.tsx`.
- Component riêng của feature đặt trong `src/views/<feature>/components`.
- Constant, helper, column, local type tách ra file riêng khi bắt đầu dài.

## Khi gọi API

- Tạo service trong `src/services` hoặc feature-local service nếu module lớn.
- Dùng type từ `@repo/shared` khi đó là contract domain/API.
- Không gọi API trực tiếp trong component trình bày.

## Shared contract FE nên dùng

Import pagination contract:

```ts
import type { PaginatedResponse, PaginationQuery } from "@repo/shared";
```

Import warranty domain types:

```ts
import type {
  ContentPageSummary,
  CustomerSummary,
  ProductSummary,
  PublicWarrantyClaimSummary,
  ServiceCenterSummary,
  WarrantyClaimSummary,
  WarrantyLookupResult,
} from "@repo/shared";
```

Import labels/constants:

```ts
import {
  CONTENT_PAGE_KIND_LABELS,
  CONTENT_PAGE_STATUS_LABELS,
  WARRANTY_CLAIM_PRIORITY_LABELS,
  WARRANTY_CLAIM_STATUS_LABELS,
  WARRANTY_STATUS_LABELS,
} from "@repo/shared/constants";
```

Table/list services nên trả nguyên `PaginatedResponse<T>` để UI dùng `meta` render pagination.

Khi search/filter/sort thay đổi, reset `page` về `1`.

## Khi viết UI

- Có đủ loading, empty, error state.
- Text body trên mobile không nhỏ hơn `16px`.
- Button/link có focus state rõ ràng.
- Layout không tạo horizontal scroll ở mobile.
- Dữ liệu trạng thái không chỉ truyền đạt bằng màu.

## Khi thêm docs cho module FE đang làm

- Tạo file mới như `warranty.md` trong `apps/docs/public/content`.
- Viết ngắn theo các phần: overview, route/API, type, UI state, edge case.
- Thêm module vào `apps/docs/public/content/modules.json`.
- Chạy `pnpm build:docs`.
- Mở lại `pnpm dev:docs` để kiểm tra sidebar và nội dung render đúng.
