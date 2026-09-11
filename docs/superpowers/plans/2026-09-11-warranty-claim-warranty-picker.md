# Warranty Claim Warranty Picker Implementation Plan

> **Execution note:** Implement inline with TDD; do not use subagents. Commit only at green task checkpoints and only when the user asks to proceed with commits.

**Goal:** Give the Admin create-claim form a fast global warranty search plus optional category/product filters, while listing every claim-eligible warranty separately.

**Architecture:** Reuse paginated `GET /warranties` with `claimEligible=true` and optional `categoryId`/`productId` filters. The global warranty search is always usable; category and product only narrow its results. `GET /products?claimEligible=true` supplies product-filter options by checking `Product.warranties.some`, while the final result list remains warranty-based and keyed by `warranty.id`.

**Tech Stack:** NestJS, Prisma, shared TypeScript contracts, Next.js 15, React Query infinite queries, React Hook Form, Jest, Node test runner.

## Global Constraints

- No Prisma schema change or migration.
- No change to `CreateWarrantyClaimBody`.
- Do not require `warranty.id === product.current_warranty_id`.
- Eligible means: warranty `ACTIVE`, non-empty code, valid start/end date, active non-deleted product, and no open claim.
- An eligible warranty must have a current ownership record; the requester may still be someone else.
- Reuse `WARRANTY_CLAIM_OPEN_STATUSES` so list and create validation agree.
- Keep server search, 300 ms debounce, infinite pagination with 20 records per page, and dealer access filtering.
- Category and product filters are optional. Direct warranty-code search must never require completing those filters first.
- Selecting a warranty prefills requester name/phone from its owner, but those requester fields remain editable.
- Preserve loading, empty, error, keyboard, focus, responsive, and dark-mode behavior.

## Task 1: Add the claim-eligible warranty query contract

**Files:**

- Modify: `packages/shared/src/types/warranty.types.ts`
- Modify: `apps/api/src/modules/warranties/dto/list-warranties.dto.ts`
- Test: `apps/api/src/modules/warranties/tests/list-warranties.dto.spec.ts`

1. Add failing DTO tests accepting `claimEligible=true|false`, rejecting `claimEligible=yes`, accepting UUID values for `categoryId`/`productId`, and rejecting invalid IDs.
2. Add `claimEligible?: "true" | "false"`, `categoryId?: string`, and `productId?: string` to `ListWarrantiesQuery`.
3. Add optional `@IsBooleanString()` and `@IsUUID()` validation to `ListWarrantiesDto`, matching existing product-query conventions.
4. Run:

   ```bash
   pnpm --filter @repo/api test -- list-warranties.dto.spec.ts --runInBand
   ```

   Expected: red before implementation, green after it.

5. Suggested green checkpoint commit: `feat(warranties): add claim eligibility query`.

## Task 2: Filter eligible records from the Warranty table

**Files:**

- Modify: `apps/api/src/modules/warranties/repository/warranties.repository.ts`
- Test: `apps/api/src/modules/warranties/tests/warranties.repository.spec.ts`

1. Freeze the test clock and add a failing repository test for `repository.list({ claimEligible: "true", limit: 20, page: 1 })`.
2. Assert the Prisma `WarrantyWhereInput` contains:

   ```ts
   {
     status: warranty_status.ACTIVE,
     warranty_code: { not: "" },
     AND: [
       { OR: [{ start_date: null }, { start_date: { lte: now } }] },
       { OR: [{ end_date: null }, { end_date: { gte: now } }] },
     ],
     claims: {
       none: { status: { in: [...WARRANTY_CLAIM_OPEN_STATUSES] } },
     },
     ownerships: {
       some: { is_current_owner: true },
     },
     product: {
       deleted_at: null,
       status: product_status.ACTIVE,
     },
   }
   ```

3. Add `claimEligible?: string`, `categoryId?: string`, and `productId?: string` to the repository filter. Implement eligibility directly on `warranty.findMany`, not through singular `Product.warranty`.
4. Let `claimEligible=true` force warranty status `ACTIVE`; keep ordinary directory calls unchanged.
5. Apply `product_id = productId` and `product.category_id = categoryId` only when supplied. Keep current search fields: warranty code, product display name/code, serial number, owner name/code.
6. Do not alter export behavior in this task.
7. Run:

   ```bash
   pnpm --filter @repo/api test -- list-warranties.dto.spec.ts warranties.repository.spec.ts list-warranties.use-case.spec.ts --runInBand
   ```

   Expected: PASS. Since the root query is `Warranty`, two eligible rows with the same `product_id` remain two results.

8. Suggested green checkpoint commit: `fix(warranties): list every claim eligible warranty`.

## Task 3: Expose details needed by the selected-warranty panel

**Files:**

- Modify: `packages/shared/src/types/warranty.types.ts`
- Modify: `apps/api/src/modules/warranties/warranties.types.ts`
- Test: `apps/api/src/modules/warranties/tests/list-warranties.use-case.spec.ts`

1. Extend the failing mapper fixture/expectation for the fields the current details UI needs: `product.displayName`, `product.status`, `product.modelYear`, `product.category`, `owner.purchaseDate`, and `owner.activatedAt`.
2. Expand `WarrantyProductSummary` and `WarrantyOwnerSummary` only with those minimal fields.
3. Map them from `warranty.product` and the current `WarrantyOwnership` in `toWarrantyListItemResponse()`.
4. Run:

   ```bash
   pnpm --filter @repo/api test -- list-warranties.use-case.spec.ts --runInBand
   pnpm --filter @repo/shared build
   pnpm --filter @repo/api check-types
   ```

   Expected: PASS.

5. Suggested green checkpoint commit: `feat(warranties): expose claim picker details`.

## Task 4: Make Product claim eligibility use all warranties

**Files:**

- Modify: `apps/api/src/modules/products/repository/products.repository.ts`
- Test: `apps/api/src/modules/products/tests/list-products.repository.spec.ts`

1. Add a failing regression test proving `claimEligible=true` uses `warranties.some` rather than singular `warranty.is`.
2. Move the existing active/code/date/open-claim conditions unchanged into:

   ```ts
   warranties: {
     some: {
       status: warranty_status.ACTIVE,
       warranty_code: { not: "" },
       ownerships: { some: { is_current_owner: true } },
       AND: [
         { OR: [{ start_date: null }, { start_date: { lte: now } }] },
         { OR: [{ end_date: null }, { end_date: { gte: now } }] },
       ],
       claims: {
         none: { status: { in: [...WARRANTY_CLAIM_OPEN_STATUSES] } },
       },
     },
   }
   ```

3. Preserve all activation-specific uses of singular `Product.warranty`; only claim eligibility changes.
4. Run:

   ```bash
   pnpm --filter @repo/api test -- list-products.repository.spec.ts --runInBand
   ```

   Expected: PASS and products with at least one eligible historical warranty can appear in the optional product filter.

5. Suggested green checkpoint commit: `fix(products): resolve claim eligibility from warranty history`.

## Task 5: Add infinite warranty loading and hybrid filter queries to Admin

**Files:**

- Modify: `apps/admin/src/hooks/use-warranties.ts`
- Modify: `apps/admin/src/views/warranty-claims/warranty-claims.utils.ts`
- Modify: `apps/admin/src/views/warranty-claims/warranty-claims.utils.test.ts`

1. Add a failing `buildWarrantyClaimWarrantyQuery()` test expecting direct search without filters:

   ```ts
   {
     claimEligible: "true",
     limit: 20,
     search: "WM-2026-ABC",
     sortBy: "createdAt",
     sortOrder: "desc",
   }
   ```

2. Add cases proving optional `categoryId` and `productId` are included when selected and omitted when empty.
3. Keep `buildWarrantyClaimProductQuery()` for the optional product picker, but make it accept `categoryId` and product-search text while retaining `claimEligible=true`.
4. Add `useInfiniteWarranties()` beside `useWarranties()`, mirroring `useInfiniteProducts()` page handling and query keys.
5. Implement the warranty query builder with trimmed global search and optional filters.
6. Run `pnpm --filter @repo/admin test`; expected PASS after implementation.
7. Suggested green checkpoint commit: `feat(admin): add hybrid claim warranty queries`.

## Task 6: Build the fast-search plus optional-filter claim form

**Files:**

- Modify: `apps/admin/src/views/warranty-claims/hooks/use-create-warranty-claim-form.ts`
- Modify: `apps/admin/src/views/warranty-claims/components/create-warranty-claim-form-card.tsx`
- Create: `apps/admin/src/views/warranty-claims/components/warranty-claim-warranty-filters.tsx`
- Rename/Modify: `apps/admin/src/views/warranty-claims/components/warranty-claim-product-search-result.tsx`
- Rename/Modify: `apps/admin/src/views/warranty-claims/components/selected-warranty-claim-product-details.tsx`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`
- Test: add a focused test under `apps/admin/src/views/warranty-claims/`

1. Extract a pure page-flattening helper and first test this regression:

   ```ts
   [
     { id: "warranty-a", productId: "product-1", warrantyCode: "WM-A" },
     { id: "warranty-b", productId: "product-1", warrantyCode: "WM-B" },
   ];
   ```

   Both options must remain. Only duplicate `warranty.id` values across pages may be removed.

2. In the form hook:
   - Load active categories with `useCategories()`.
   - Load product-filter options with `useInfiniteProducts(buildWarrantyClaimProductQuery(categoryId, productSearch))`.
   - Use `WarrantyListItem` and `useInfiniteWarranties()`.
   - Keep separate state for global warranty search, category filter, product filter, and product-filter search.
   - Deduplicate by `warranty.id`, never `product.id`.
   - Changing category clears an incompatible selected product and selected warranty.
   - Changing product clears the selected warranty but retains the global search text.
   - Clearing filters returns immediately to global eligible-warranty results.
   - On selection set `productId = warranty.productId` and `warrantyCode = warranty.warrantyCode`.
   - Prefill requester data from `warranty.owner`, preserving customer hydration by `customerId`.
   - Leave create mutation and API validation unchanged.

3. Build the UI in this order:
   - Primary field: **“Tìm mã bảo hành, sản phẩm hoặc khách hàng”**, always enabled.
   - Secondary collapsible/compact area: optional category and product filters plus **“Xóa bộ lọc”**.
   - Warranty results in the existing accessible `SearchDropdown`.
4. Rename the two product-oriented presentation components to warranty-oriented names.
5. Use `warranty.id` for `SearchDropdown.getItemKey`.
6. Render each option with this hierarchy:
   - Warranty code as the unique primary label.
   - Product display name and product code.
   - Serial number and current owner.
   - Active status and validity dates as supporting information.
7. Read selected warranty fields directly from `selectedWarranty`; never use `product.warranty` or `product.warrantyCode`.
8. Prefill requester name/phone from the owner, but do not disable or lock those fields. Editing them must not mutate warranty ownership.
9. Update Vietnamese and English labels for fast search, optional filters, clear filters, and empty filtered results.
10. Preserve visible field labels, keyboard operation, 44px input target, truncation, loading/empty feedback, responsive layout, and theme tokens.
11. Run:

```bash
pnpm --filter @repo/admin test
pnpm --filter @repo/shared build
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin lint
```

Expected: PASS.

12. Suggested green checkpoint commit: `fix(admin): add hybrid warranty selection for claims`.

## Task 7: Acceptance and full regression verification

1. Manually open `/vi/warranty-claims/create` and verify:
   - Global results load 20 at a time and fetch the next page at the end.
   - Entering an exact warranty code works without selecting category or product.
   - Warranty code, product name/code, serial, and owner searches run server-side.
   - Selecting a category narrows products and warranties; selecting a product narrows warranties further.
   - Clearing filters restores global search results.
   - Four eligible warranties attached to one product appear as four separate rows.
   - Each row shows and submits its own warranty code, dates, and owner.
   - Ownerless, out-of-date, and already-open-claim warranties are absent.
   - Requester fields start from owner data but can be edited for a different sender.
   - Submission creates a claim against the selected warranty.
   - Keyboard, loading, empty, narrow viewport, and dark mode states remain usable.
2. Run targeted suites:

   ```bash
   pnpm --filter @repo/api test -- list-warranties.dto.spec.ts warranties.repository.spec.ts list-warranties.use-case.spec.ts create-warranty-claim.use-case.spec.ts --runInBand
   pnpm --filter @repo/admin test
   ```

3. Run full checks:

   ```bash
   pnpm lint
   pnpm check-types
   pnpm test
   pnpm build
   ```

4. Review scope:

   ```bash
   git status --short
   git diff --check
   git diff --stat
   git diff
   ```

5. Confirm there is no migration, no request-body change, and no unrelated edit. Record any pre-existing unrelated failure instead of changing unrelated files.

## Acceptance Criteria

- The create-claim picker represents warranties, not products.
- Users can search an exact warranty immediately; category/product selection is never mandatory.
- Category and product behave only as narrowing filters and can be cleared.
- Multiple eligible warranties sharing one `productId` remain independently visible and selectable.
- Warranty code, dates, owner, and product metadata all come from the same `WarrantyListItem`.
- Only warranties with a current owner appear, while requester information remains editable and independent of ownership.
- Search and infinite scrolling stay server-driven and paginated.
- API filtering prevents known ineligible options; create-claim validation remains the final concurrency-safe guard.
- Warranty directory/export behavior does not regress.
- Targeted tests and full repository checks pass before completion is claimed.
