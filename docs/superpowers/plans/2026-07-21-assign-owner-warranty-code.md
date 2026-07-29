# Assign Owner Warranty Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Product chỉ nhận `warrantyCode` khi được gán chủ sở hữu lần đầu, với lựa chọn tự sinh hoặc nhập thủ công.

**Architecture:** Product creation giữ Warranty DRAFT không mã. Assign owner là seam cấp mã và ghi Product, Warranty, Ownership trong một transaction; activation request tiếp tục là seam kích hoạt Warranty.

**Tech Stack:** Prisma, NestJS, Jest, TypeScript shared contracts, React Hook Form, Zod, React Query, Next.js Admin.

## Global Constraints

- Không thay đổi `productCode`; mã này vẫn sinh khi tạo Product.
- Không thay mã bảo hành khi chuyển chủ nếu Product đã có mã.
- Không kích hoạt Warranty trong Assign Owner.
- Giữ và không ghi đè các thay đổi Product chưa commit của người dùng.

---

### Task 1: Nullable warranty code persistence

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260721150000_make_warranty_code_assignment_deferred/migration.sql`
- Modify: `packages/shared/src/types/product.types.ts`
- Modify: `apps/api/src/modules/products/products.types.ts`

**Interfaces:**

- Produces: nullable `warrantyCode` in Product and Warranty responses.

- [ ] Write/adjust mapper and type tests that expect null before assignment.
- [ ] Run focused tests and verify the nullable expectation fails.
- [ ] Make both database columns nullable while preserving unique indexes.
- [ ] Update shared response types and mapper output.
- [ ] Run focused tests and verify they pass.

### Task 2: Product creation without warranty code

**Files:**

- Modify: `apps/api/src/modules/products/dto/create-product.dto.ts`
- Modify: `apps/api/src/modules/products/use-cases/create-product.use-case.ts`
- Modify: `apps/api/src/modules/products/tests/create-product.use-case.spec.ts`
- Modify: `packages/shared/src/types/product.types.ts`

**Interfaces:**

- Produces: Product plus DRAFT Warranty with null code and default 36-month policy.

- [ ] Add a failing use-case test expecting Product and Warranty code null.
- [ ] Run `pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/create-product.use-case.spec.ts` and confirm failure.
- [ ] Remove warranty/owner inputs from Create Product DTO and use case.
- [ ] Keep Product code generation and DRAFT Warranty creation.
- [ ] Re-run focused test and confirm pass.

### Task 3: Assign owner issues warranty code

**Files:**

- Modify: `apps/api/src/modules/products/dto/assign-product-owner.dto.ts`
- Modify: `apps/api/src/modules/products/use-cases/assign-product-owner.use-case.ts`
- Modify: `apps/api/src/modules/products/tests/assign-product-owner.use-case.spec.ts`
- Modify: `packages/shared/src/types/product.types.ts`

**Interfaces:**

- Consumes: `GenerateWarrantyCodeUseCase.execute(): Promise<string>`.
- Produces: atomic Product/Warranty code update plus ownership assignment.

- [ ] Add failing tests for generated code, manual uppercase code, duplicate code and preserving existing code.
- [ ] Run focused test and confirm expected failures.
- [ ] Validate/resolve the code before transaction and check uniqueness.
- [ ] Update Product and Warranty inside the ownership transaction.
- [ ] Re-run focused tests and confirm pass.

### Task 4: Admin Product and Assign Owner forms

**Files:**

- Modify: `apps/admin/src/views/products/components/product-form.tsx`
- Modify: `apps/admin/src/views/products/hooks/use-product-form.ts`
- Modify: `apps/admin/src/views/products/products.types.ts`
- Modify: `apps/admin/src/views/products/components/assign-owner-dialog.tsx`
- Modify: `apps/admin/src/views/products/hooks/use-assign-product-owner.ts`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/services/products/products.service.test.ts`

**Interfaces:**

- Consumes: nullable Product code and extended Assign Owner body.
- Produces: Product Create payload without warranty fields; Assign Owner payload with code strategy.

- [ ] Add failing serializer/service tests for the new request bodies.
- [ ] Remove Customer and Warranty section from Product Create.
- [ ] Add code toggle/manual input/read-only state to Assign Owner dialog.
- [ ] Map backend validation errors to localized feedback.
- [ ] Run Admin tests and confirm pass.

### Task 5: Compatibility review and verification

**Files:**

- Modify as required: Product/Warranty list/detail renderers that assume a non-null code.

**Interfaces:**

- Produces: code-null-safe Admin pages and unchanged activation behavior after assignment.

- [ ] Search all Product warranty-code consumers and handle null before assignment.
- [ ] Run API Product tests, Admin tests, lint, typecheck and `git diff --check`.
- [ ] Review migration and final diff for unrelated changes.
