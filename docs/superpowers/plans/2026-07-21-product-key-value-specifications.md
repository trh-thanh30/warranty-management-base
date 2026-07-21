# Product Key/Value Specifications Implementation Plan

**Goal:** Add dynamic key/value technical specifications to Product create, edit, and detail using the existing `metadata` contract.

**Architecture:** React Hook Form manages a field array of specification rows. Pure helpers convert between rows and `metadata.specifications`, preserving unrelated metadata. Zod validates complete and unique rows. The existing Product service and backend Product DTO remain unchanged.

**Tech Stack:** Next.js 16, React 19, React Hook Form, Zod, next-intl, Tailwind CSS, `@repo/ui`, Node test runner.

---

### Task 1: Specify metadata conversion behavior

**Files:**

- Create: `apps/admin/src/views/products/products.utils.test.ts`
- Modify: `apps/admin/src/views/products/products.utils.ts`

1. Add failing tests for reading specifications, preserving unrelated metadata, clearing specifications, trimming values, and ignoring malformed historical data.
2. Run the focused Admin test file and verify the missing helper failures.
3. Implement the minimal pure conversion helpers.
4. Re-run the focused tests.

### Task 2: Add form schema behavior

**Files:**

- Modify: `apps/admin/src/views/products/products.utils.test.ts`
- Modify: `apps/admin/src/views/products/products.types.ts`

1. Add failing tests for complete rows, partial rows, duplicate trimmed keys, and empty rows.
2. Run the focused tests and verify the validation failures.
3. Add the specification row schema and duplicate-key refinement.
4. Re-run the focused tests.

### Task 3: Connect specifications to Product payloads

**Files:**

- Modify: `apps/admin/src/views/products/hooks/use-product-form.ts`

1. Add `specifications` to form defaults.
2. Populate edit defaults from Product metadata.
3. Merge specifications into create/update metadata payloads.
4. Expose field-array operations to the Product form.

### Task 4: Build the dynamic key/value UI

**Files:**

- Create: `apps/admin/src/views/products/components/product-specifications-fields.tsx`
- Modify: `apps/admin/src/views/products/components/product-form.tsx`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`

1. Render responsive key/value rows with stable field IDs.
2. Add accessible add/remove controls and inline validation.
3. Add EN/VI labels, placeholders, descriptions, and validation messages.
4. Keep the existing Product form hierarchy and design tokens.

### Task 5: Display specifications in Product detail

**Files:**

- Modify: `apps/admin/src/views/products/components/product-detail-card.tsx`

1. Read valid specification entries through the shared helper.
2. Render a compact key/value section only when entries exist.
3. Ensure long keys and values wrap safely on mobile.

### Task 6: Verify the feature

1. Run `pnpm.cmd --filter @repo/admin test`.
2. Run `pnpm.cmd --filter @repo/admin lint`.
3. Run `pnpm.cmd --filter @repo/admin check-types`.
4. Run `git diff --check`.
5. Review the Product form at 375px and desktop width.
