# Product Assigned Activation Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Tạo trang riêng quản lý các mã kích hoạt đã gán vào một sản phẩm với tìm kiếm, lọc, phân trang và action theo trạng thái.

**Architecture:** Frontend dùng route động `/products/[productId]/activation-codes`; page chỉ render view. Backend thêm endpoint list mã theo product id, tái sử dụng `ActivationCodeDetailList` và pagination hiện có. Product list/detail chỉ hiển thị summary và link quản lý.

**Tech Stack:** Next.js App Router, React Query, NestJS, Prisma, `@repo/shared`, `@repo/ui`, Jest, TypeScript.

## Global Constraints

- Không dùng query string cho route frontend; product id nằm trong path.
- API/domain type dùng chung đặt trong `packages/shared`.
- Controller chỉ gọi use case; Prisma query nằm trong repository.
- API phân trang, không tải toàn bộ mã về frontend.
- UI ẩn action không hợp lệ nhưng API vẫn kiểm tra permission/trạng thái.
- Không tạo migration nếu chỉ dùng quan hệ hiện có.

---

### Task 1: API list mã theo sản phẩm

**Files:**

- Modify: `apps/api/src/modules/activation-codes/activation-codes.controller.ts`
- Modify: `apps/api/src/modules/activation-codes/use-cases/list-activation-codes.use-case.ts`
- Modify: `apps/api/src/modules/activation-codes/repository/activation-code-batches.repository.ts`
- Modify: `apps/admin/src/services/activation-codes/create-activation-codes.service.ts`
- Modify: `apps/admin/src/services/activation-codes/activation-code-batches.types.ts`
- Test: `apps/api/src/modules/activation-codes/tests/list-activation-codes.use-case.spec.ts`

- [ ] Viết test use case cho việc truyền product id/filter, trả pagination và báo NotFound khi product không tồn tại.
- [ ] Chạy test trước implementation:

```bash
pnpm --filter @repo/api exec jest src/modules/activation-codes/tests/list-activation-codes.use-case.spec.ts --runInBand
```

- [ ] Thêm repository method lọc `product_id`, status tùy chọn, search bằng `code_hash`, dùng `normalizePagination`, order mới nhất trước `[{ created_at: "desc" }, { id: "desc" }]`, và reuse detail select/mapping hiện có.
- [ ] Thêm use-case method và route `GET /activation-code-batches/codes/product/:productId` trước các route code động.
- [ ] Thêm Admin service method `listCodesByProduct(productId, query): Promise<ActivationCodeDetailList>`.
- [ ] Chạy API test và `pnpm --filter @repo/api check-types`.
- [ ] Commit `feat: list activation codes by product`.

### Task 2: Route, view, hook và table

**Files:**

- Create: `apps/admin/app/[locale]/(dashboard)/products/[productId]/activation-codes/page.tsx`
- Create: `apps/admin/src/views/activation-code-batches/product-activation-codes.view.tsx`
- Create: `apps/admin/src/views/activation-code-batches/components/product-activation-codes-table.tsx`
- Create: `apps/admin/src/views/activation-code-batches/hooks/use-product-activation-codes.ts`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`
- Test: `apps/admin/src/views/activation-code-batches/product-activation-codes-layout.test.ts`

- [ ] Tạo page mỏng nhận `params.productId` và render `<ProductActivationCodesView productId={productId} />`.
- [ ] Hook quản lý page, limit, search, status; reset page về 1 khi search/status đổi.
- [ ] View có back link về `/products/<productId>`, title, loading/error/empty/success/pagination state.
- [ ] Filter responsive: search mã, status select, page-size select; desktop cùng hàng, mobile xếp dọc.
- [ ] Table một mã mỗi row: mã + copy, trạng thái, lô mã, ngày tạo/gán, hạn kích hoạt và action.
- [ ] Thêm translation Việt/Anh, layout test, rồi chạy admin check-types và lint.
- [ ] Commit `feat: add product activation code management page`.

### Task 3: Summary và link từ product list/detail

**Files:**

- Modify: `apps/admin/src/views/products/components/products-table.tsx`
- Modify: `apps/admin/src/views/products/components/product-detail-card.tsx`
- Modify: `apps/admin/src/views/products/product-detail.view.tsx`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`
- Test: `apps/admin/src/views/products/products-table-layout.test.ts`
- Test: `apps/admin/src/views/products/product-detail-layout.test.ts`

- [ ] Thay việc map nhiều mã trong product table bằng summary như `3 mã kích hoạt` và `2 có thể kích hoạt · 1 đã sử dụng`.
- [ ] Thêm action `Quản lý mã kích hoạt đã gán` vào dropdown, link đến `/products/<productId>/activation-codes`.
- [ ] Giữ detail card cho xem nhanh và thêm link `Xem tất cả mã` tới route mới.
- [ ] Cập nhật regression tests để row không map toàn bộ codes; chạy test/lint.
- [ ] Commit `feat: link products to assigned activation codes`.

### Task 4: Action gỡ gán và đổi mã

**Files:**

- Modify: `apps/admin/src/views/activation-code-batches/components/product-activation-codes-table.tsx`
- Modify: `apps/admin/src/views/activation-code-batches/product-activation-codes.view.tsx`
- Reuse: `apps/admin/src/views/activation-code-batches/components/activation-code-product-assignment-dialog.tsx`
- Reuse: `apps/admin/src/services/activation-codes/create-activation-codes.service.ts`
- Test: existing unassign/replace use-case tests under `apps/api/src/modules/activation-codes/tests`

- [ ] Chỉ hiện gỡ gán/đổi mã cho `AVAILABLE`; ẩn với `PENDING_APPROVAL`, `ACTIVATED`, `EXPIRED`, `REVOKED`, `REPLACED`.
- [ ] Dùng endpoint hiện có cho unassign/replace; sau mutation invalidate product-code và product-detail query, đóng dialog và hiển thị toast.
- [ ] Chạy API activation-code tests, admin check-types/lint và `git diff --check`.
- [ ] Manual acceptance: 0/3/hàng trăm mã; mới nhất đứng đầu; search/status/pagination; mobile không tràn ngang; action đúng trạng thái.
- [ ] Commit `feat: manage assigned activation code actions`.

### Final verification

```bash
pnpm --filter @repo/api check-types
pnpm --filter @repo/api lint
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin lint
git diff --check
```

Không cần migration database cho feature này; nếu schema thay đổi thì chạy `prisma migrate` local hoặc `prisma migrate deploy` production trước khi restart API.
