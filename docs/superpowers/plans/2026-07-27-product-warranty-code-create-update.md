# Product Warranty Code on Create and Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure manual Product create/update produces the same coded draft Warranty as Product import.

**Architecture:** Keep the business decision in the existing Product use cases and reuse `GenerateWarrantyCodeUseCase`. Create generates inside its existing transaction; update writes the generated code through the existing nested Product update so an existing code is preserved and legacy missing Warranty data is repaired.

**Tech Stack:** NestJS, TypeScript, Prisma, Jest

## Global Constraints

- Do not change Product create/update DTOs.
- Do not change Prisma schema or add migrations.
- Preserve an existing non-null warranty code.
- Keep Warranty status `DRAFT`; do not populate activation dates or ownership.
- Do not stage or commit changes without explicit user instruction.

---

### Task 1: Generate a warranty code during Product creation

**Files:**

- Modify: `apps/api/src/modules/products/tests/create-product.use-case.spec.ts`
- Modify: `apps/api/src/modules/products/use-cases/create-product.use-case.ts`

**Interfaces:**

- Consumes: `GenerateWarrantyCodeUseCase.execute(date?: Date, tx?: Prisma.TransactionClient): Promise<string>`
- Produces: a created Product whose nested Warranty has `warranty_code` populated.

- [ ] **Step 1: Write the failing test**

Add a mocked `GenerateWarrantyCodeUseCase`, pass it to the use case, and assert:

```ts
expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledWith(
  expect.any(Date),
  tx,
);
expect(productCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    data: expect.objectContaining({
      warranty: {
        create: expect.objectContaining({
          warranty_code: "WM-2026-CREATE",
          status: warranty_status.DRAFT,
        }),
      },
    }),
  }),
);
```

- [ ] **Step 2: Run the focused create test and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/create-product.use-case.spec.ts
```

Expected: FAIL because the constructor does not receive the warranty generator and Product creation still writes `warranty_code: null`.

- [ ] **Step 3: Implement the minimal create behavior**

Inject `GenerateWarrantyCodeUseCase`, generate inside the existing transaction, and pass the result to the nested Warranty create:

```ts
const warrantyCode = await this.generateWarrantyCodeUseCase.execute(
  new Date(),
  tx,
);

warranty: {
  create: {
    warranty_code: warrantyCode,
    // retain existing template defaults and DRAFT state
  },
},
```

- [ ] **Step 4: Run the focused create test and verify GREEN**

Run the same focused Jest command. Expected: PASS.

---

### Task 2: Repair a missing warranty code during Product update

**Files:**

- Modify: `apps/api/src/modules/products/tests/update-product.use-case.spec.ts`
- Modify: `apps/api/src/modules/products/use-cases/update-product.use-case.ts`

**Interfaces:**

- Consumes: `existingProduct.warranty` and `existingProduct.template` returned by `ProductsRepository.findById`.
- Produces: nested Prisma `warranty.update` or `warranty.create` data only when the existing Warranty has no code.

- [ ] **Step 1: Write failing update tests**

Add tests for these exact branches:

```ts
// Existing Warranty without code
warranty: {
  update: { warranty_code: 'WM-2026-UPDATE' },
}

// Existing code
expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
expect(repository.update).toHaveBeenCalledWith(
  'product-id',
  expect.objectContaining({ warranty: undefined }),
);

// Missing Warranty
warranty: {
  create: {
    warranty_code: 'WM-2026-UPDATE',
    duration_months: existing.template.default_warranty_duration_months,
    terms: existing.template.default_warranty_terms,
    start_date: null,
    end_date: null,
    status: warranty_status.DRAFT,
  },
}
```

- [ ] **Step 2: Run the focused update test and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/update-product.use-case.spec.ts
```

Expected: FAIL because update neither invokes the warranty generator nor sends a nested Warranty write.

- [ ] **Step 3: Implement the minimal update behavior**

Inject `GenerateWarrantyCodeUseCase`. Before calling the repository:

```ts
const warranty = existingProduct.warranty?.warranty_code
  ? undefined
  : await this.buildMissingWarrantyWrite(existingProduct);
```

The helper generates one code and returns:

- `{ update: { warranty_code: code } }` when Warranty exists.
- `{ create: { warranty_code: code, template defaults, null dates, DRAFT } }` when Warranty is missing.

Pass `warranty` into the existing `ProductsRepository.update` data object.

- [ ] **Step 4: Run the focused update test and verify GREEN**

Run the same focused Jest command. Expected: PASS.

---

### Task 3: Verify all Product warranty-code flows

**Files:**

- Verify: `apps/api/src/modules/products/tests/create-product.use-case.spec.ts`
- Verify: `apps/api/src/modules/products/tests/update-product.use-case.spec.ts`
- Verify: `apps/api/src/modules/products/tests/confirm-product-import.use-case.spec.ts`

**Interfaces:**

- Consumes: create, update, and import Product use cases.
- Produces: regression evidence that all three entry points generate codes without overwriting existing ones.

- [ ] **Step 1: Run all three focused suites**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/create-product.use-case.spec.ts src/modules/products/tests/update-product.use-case.spec.ts src/modules/products/tests/confirm-product-import.use-case.spec.ts
```

Expected: all suites PASS.

- [ ] **Step 2: Run API type checking**

```powershell
pnpm.cmd --filter @repo/api check-types
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Inspect the final diff**

```powershell
git diff --check
git status --short
git diff -- apps/api/src/modules/products
```

Expected: no whitespace errors; only approved source/test changes plus the uncommitted design/plan documents.
