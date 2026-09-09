# Activation Code Quantity Assignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace position-range assignment with automatic quantity assignment across all available batches or selected batches.

**Architecture:** Keep manual selection and per-batch `ALL_AVAILABLE`. Replace only `RANGE` with `QUANTITY`. Admin submits quantity and optional batch ids; the API selects, validates, and assigns candidates transactionally.

**Tech Stack:** NestJS, Prisma, Next.js, TanStack Query, next-intl, node:test, Jest.

## Global Constraints

- An empty batch selection means all batches with assignable codes.
- Operators may select one or more batches to constrain quantity assignment.
- Candidates are ordered by `expires_at ASC`, `created_at ASC`, then `id ASC`.
- A code is assignable only when unassigned, AVAILABLE, unexpired, and not linked to a request, request item, or warranty.
- The operation is all-or-nothing: insufficient availability assigns zero codes.
- Quantity is an integer from 1 through `MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT` (1000).

---

### Task 1: Add the quantity assignment contract

**Files:**

- Modify: `packages/shared/src/constants/activation-code-batches.ts`
- Modify: `packages/shared/src/types/activation-code-report.types.ts`
- Test: `apps/admin/src/services/activation-codes/activation-codes.service.test.ts`

**Consumes:** Existing `AssignActivationCodesToProductBody`.
**Produces:** `assignmentMode: "QUANTITY"` body with `quantity` and optional `batchIds`.

- [ ] **Step 1: Write the failing Admin service test**

```ts
await service.assignProduct({
  assignmentMode: "QUANTITY",
  batchIds: ["batch-a", "batch-b"],
  productId: "product-id",
  quantity: 10,
});
assert.deepEqual(calls[0]?.body, {
  assignmentMode: "QUANTITY",
  batchIds: ["batch-a", "batch-b"],
  productId: "product-id",
  quantity: 10,
});
```

- [ ] **Step 2: Run it and verify RED**

Run: `pnpm --filter @repo/admin test -- activation-codes.service.test.ts`
Expected: TypeScript/test failure because `QUANTITY` is not in the shared union.

- [ ] **Step 3: Implement the minimum shared contract**

```ts
export const ACTIVATION_CODE_PRODUCT_ASSIGNMENT_MODES = [
  "SELECTED",
  "ALL_AVAILABLE",
  "QUANTITY",
] as const;
```

Add the discriminated body variant:

```ts
{
  assignmentMode: "QUANTITY";
  batchIds?: string[];
  productId: string;
  quantity: number;
}
```

- [ ] **Step 4: Run GREEN**

Run: `pnpm --filter @repo/admin test -- activation-codes.service.test.ts`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/constants/activation-code-batches.ts packages/shared/src/types/activation-code-report.types.ts apps/admin/src/services/activation-codes/activation-codes.service.test.ts
git commit -m "feat: add quantity activation-code assignment contract"
```

### Task 2: Implement transactional cross-batch allocation

**Files:**

- Modify: `apps/api/src/modules/activation-codes/dto/assign-activation-codes-to-product.dto.ts`
- Modify: `apps/api/src/modules/activation-codes/use-cases/assign-activation-codes-to-product.use-case.ts`
- Modify: `apps/api/src/modules/activation-codes/repository/activation-code-batches.repository.ts`
- Modify: `apps/api/src/modules/activation-codes/tests/assign-activation-codes-to-product.dto.spec.ts`
- Modify: `apps/api/src/modules/activation-codes/tests/assign-activation-codes-to-product.use-case.spec.ts`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`

**Consumes:** Task 1 `QUANTITY` body.
**Produces:** normal assignment result, or `ACTIVATION_CODE_ASSIGNMENT_INSUFFICIENT` with requested and available quantities.

- [ ] **Step 1: Write failing tests**

```ts
await useCase.execute({
  assignmentMode: "QUANTITY",
  batchIds: ["batch-a", "batch-b"],
  productId: "product-id",
  quantity: 10,
});

expect(repository.assignProductByQuantity).toHaveBeenCalledWith({
  batchIds: ["batch-a", "batch-b"],
  now: expect.any(Date),
  productId: "product-id",
  quantity: 10,
});
```

Also test a repository result with fewer than 10 candidates: the use case returns `ACTIVATION_CODE_ASSIGNMENT_INSUFFICIENT` and never calls the update.

- [ ] **Step 2: Run RED**

Run: `pnpm --filter @repo/api test -- assign-activation-codes-to-product`
Expected: new tests fail because the mode/repository method do not exist.

- [ ] **Step 3: Validate quantity and batch ids**

Remove `RANGE`, `from`, and `to` DTO validation. Add:

```ts
@ValidateIf((input) => input.assignmentMode === "QUANTITY")
@IsInt()
@Min(1)
@Max(MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT)
quantity?: number;
```

Validate optional `batchIds` as an array of UUIDs when mode is `QUANTITY`.

- [ ] **Step 4: Add `assignProductByQuantity`**

Use one Prisma transaction. Query at most `quantity` candidates:

```ts
where: this.buildAssignableWhere(
  input.batchIds?.length ? { batch_id: { in: input.batchIds } } : {},
  input.now,
),
orderBy: [
  { expires_at: "asc" },
  { created_at: "asc" },
  { id: "asc" },
],
take: input.quantity,
```

If fetched count is below quantity, return an insufficient result before updating. Otherwise keep the existing conditional `updateMany` guard to detect concurrent claims.

- [ ] **Step 5: Localize the shortage error**

Add `ACTIVATION_CODE_ASSIGNMENT_INSUFFICIENT` in Vietnamese and English, showing requested and available totals.

- [ ] **Step 6: Run GREEN**

Run: `pnpm --filter @repo/api test -- assign-activation-codes-to-product`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/activation-codes apps/admin/src/messages/vi.json apps/admin/src/messages/en.json
git commit -m "feat: assign activation codes by quantity across batches"
```

### Task 3: Replace range controls with quantity and multi-batch selection

**Files:**

- Modify: `apps/admin/src/views/products/components/assign-activation-codes-form.tsx`
- Modify: `apps/admin/src/views/products/products-table-layout.test.ts`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`

**Consumes:** Task 1 service body and Task 2 API behavior.
**Produces:** `{ assignmentMode: "QUANTITY", quantity, batchIds?: string[] }`.

- [ ] **Step 1: Write failing UI-source tests**

Assert that the form:

1. renders a number input for quantity;
2. supports toggling multiple batch options;
3. sends `QUANTITY`;
4. has no `rangeFrom`, `rangeTo`, or `assignmentMode: "RANGE"`.

- [ ] **Step 2: Run RED**

Run: `pnpm --filter @repo/admin test -- products-table-layout.test.ts`
Expected: failure because the range UI remains.

- [ ] **Step 3: Replace range state**

```ts
const [quantity, setQuantity] = useState("1");
const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

const parsedQuantity = Number(quantity);
const hasValidQuantity =
  Number.isInteger(parsedQuantity) &&
  parsedQuantity >= 1 &&
  parsedQuantity <= MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT;
```

Keep “Tất cả lô khả dụng” as the default. It maps to no `batchIds`. Toggle selected ids in the existing searchable batch dropdown and label the trigger with selected batch count. Do not calculate availability on the client.

- [ ] **Step 4: Submit and reset**

```ts
return activationCodesService.assignProduct({
  assignmentMode: "QUANTITY",
  ...(selectedBatchIds.length ? { batchIds: selectedBatchIds } : {}),
  productId: product!.id,
  quantity: parsedQuantity,
});
```

Reset quantity, selected batches, errors, and manual selected codes after success/cancel. Preserve current manual and `ALL_AVAILABLE` behavior.

- [ ] **Step 5: Add/remove copy**

Add keys for quantity mode, quantity description, quantity label, invalid quantity, all batches default, and selected batch count. Remove range-only keys only after confirming no consumers remain.

- [ ] **Step 6: Run GREEN**

Run: `pnpm --filter @repo/admin test -- products-table-layout.test.ts`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/views/products/components/assign-activation-codes-form.tsx apps/admin/src/views/products/products-table-layout.test.ts apps/admin/src/messages/vi.json apps/admin/src/messages/en.json
git commit -m "feat: choose activation-code quantity and batches"
```

### Task 4: Verify all integration boundaries

**Files:**

- Modify only if verification exposes a defect.

- [ ] **Step 1: Check the diff**

Run: `git diff --check`
Expected: no output.

- [ ] **Step 2: Run automated checks**

Run:

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/api lint
pnpm --filter @repo/api check-types
pnpm --filter @repo/api test
pnpm --filter @repo/admin lint
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin test
```

Expected: every command exits 0.

- [ ] **Step 3: Manual acceptance**

1. Request 10 codes with no batch selected; verify allocation can span batches and picks earliest expiry first.
2. Select only batch A and batch B; verify no code outside A/B is assigned.
3. Request more than the available count; verify no partial assignment and a localized error.
4. Confirm manual selection and per-batch “assign all available” still work.

- [ ] **Step 4: Commit verification fixes if needed**

```bash
git add <verified-files>
git commit -m "test: cover quantity activation-code assignment"
```
