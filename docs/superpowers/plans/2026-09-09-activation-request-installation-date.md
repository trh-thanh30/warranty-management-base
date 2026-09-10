# Ngày thi công trong yêu cầu kích hoạt bảo hành Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm ngày và giờ thi công tùy chọn vào form tạo/sửa yêu cầu kích hoạt bảo hành và hiển thị ở trang chi tiết.

**Architecture:** Reuse the existing `installedAt` API/database contract. Keep form state and validation in the activation-request feature, map local datetime input to an ISO timestamp at the service boundary, and render the value through the existing localized date formatter.

**Tech Stack:** Next.js, React Hook Form, Zod, NestJS DTOs, Prisma, shared TypeScript contracts, Node test runner.

## Global Constraints

- Không tạo migration vì `installed_at` đã tồn tại trong Prisma schema.
- Trường ngày thi công không bắt buộc trong task này.
- `app/**/page.tsx` vẫn là server component mỏng; code UI nằm trong `src/views`.
- Tất cả wording mới phải đi qua `en.json` và `vi.json`.

---

### Task 1: Lock the request-body contract with tests

**Files:**

- Modify: `apps/admin/src/views/warranty-activation-requests/warranty-activation-requests.utils.test.ts`

**Interfaces:**

- Consumes: `WarrantyActivationRequestCreateFormValues` and `toAdminActivationRequestBody`.
- Produces: Regression coverage proving an entered local installation date is sent as an ISO timestamp and an empty value is omitted.

- [ ] **Step 1: Add a failing mapping test**

Add `installedAt: ""` to the shared test fixture and assert that `toAdminActivationRequestBody` maps `installedAt: "2026-09-09T14:30"` to a non-empty ISO timestamp while omitting it for an empty form value.

- [ ] **Step 2: Run the focused test and verify it fails**

Run `pnpm --filter @repo/admin test -- warranty-activation-requests.utils.test.ts`.

Expected: the new assertion fails because the form type/mapper do not yet include `installedAt`.

### Task 2: Add installation date to the admin form

**Files:**

- Modify: `apps/admin/src/views/warranty-activation-requests/warranty-activation-requests.types.ts`
- Modify: `apps/admin/src/views/warranty-activation-requests/hooks/use-create-warranty-activation-request-form.ts`
- Modify: `apps/admin/src/views/warranty-activation-requests/components/create-warranty-activation-request-form-card.tsx`
- Modify: `apps/admin/src/views/warranty-activation-requests/warranty-activation-requests.utils.ts`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`

**Interfaces:**

- Consumes: Existing shared `installedAt?: string` request field.
- Produces: Optional `installedAt` form value, rendered as `datetime-local`, hydrated during edit, and mapped to the API body.

- [ ] **Step 1: Add the form field and optional schema rule**

Define `installedAt: string` in the form values, add `installedAt: z.string().trim()`, and initialize it to `""` in `DEFAULT_VALUES`.

- [ ] **Step 2: Map the value to the existing API contract**

In `toAdminActivationRequestBody`, add `installedAt: values.installedAt ? new Date(values.installedAt).toISOString() : undefined` to the `omitUndefined` payload.

- [ ] **Step 3: Hydrate edit state**

Set `installedAt` from `initialRequest.installedAt` converted to the `datetime-local` local-input shape; use `""` when the request has no value.

- [ ] **Step 4: Render the field**

Add a `FormField` labeled with `t("installedAt")`, using `<Input type="datetime-local" {...register("installedAt")} />`, beside the vehicle fields after a product is selected.

- [ ] **Step 5: Add English and Vietnamese translations**

Add `installedAt` and `installedAtPlaceholder` keys to both locale message objects.

- [ ] **Step 6: Run the focused test and admin typecheck**

Run `pnpm --filter @repo/admin test -- warranty-activation-requests.utils.test.ts` and `pnpm --filter @repo/admin check-types`.

Expected: the mapping tests pass and TypeScript exits with code 0.

### Task 3: Show the date on the request detail page

**Files:**

- Modify: `apps/admin/src/views/warranty-activation-requests/components/warranty-activation-request-detail-card.tsx`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`
- Test: `apps/admin/src/views/warranty-activation-requests/warranty-activation-request-detail-locales.test.ts`

**Interfaces:**

- Consumes: `WarrantyActivationRequestSummary.installedAt` and `formatActivationRequestDate`.
- Produces: A localized “Ngày thi công” detail row with date/time or `-`.

- [ ] **Step 1: Add a failing detail assertion**

Extend the detail source/locale test to require the `installedAt` label and detail-card reference.

- [ ] **Step 2: Run the focused test and verify it fails**

Run `pnpm --filter @repo/admin test -- warranty-activation-request-detail-locales.test.ts`.

Expected: the new assertion fails because the detail card does not render the field.

- [ ] **Step 3: Render the detail row**

Add the field to the request-information grid and format it with `formatActivationRequestDate(request.installedAt, locale)`.

- [ ] **Step 4: Run the focused test**

Run `pnpm --filter @repo/admin test -- warranty-activation-request-detail-locales.test.ts`.

Expected: all focused tests pass.

### Task 4: Verify the complete change

**Files:**

- No additional source files.

- [ ] **Step 1: Restore generated Next environment files if type generation changed them**

Keep `apps/admin/next-env.d.ts` and `apps/web/next-env.d.ts` out of this feature diff unless they were intentionally changed.

- [ ] **Step 2: Run lint and all relevant checks**

Run `pnpm lint`, `pnpm check-types`, `pnpm test`, and `pnpm build`.

- [ ] **Step 3: Review the final diff**

Run `git diff --check` and `git diff --stat`; confirm only installation-date implementation, tests, translations, and planning documents are present.
