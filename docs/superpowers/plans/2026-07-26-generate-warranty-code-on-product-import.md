# Generate Warranty Codes on Product Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every Product created through Excel import receives its own unique Warranty code while the Warranty remains `DRAFT`.

**Architecture:** Reuse `GenerateWarrantyCodeUseCase` inside the existing product-import transaction. New Product rows receive the generated code in their nested Warranty create; update rows preserve an existing code and only generate one when the linked Warranty is missing a code. A separate explicit backfill script handles existing database rows without changing activation behavior.

**Tech Stack:** NestJS, Prisma/PostgreSQL, Jest, TypeScript, pnpm.

## Global Constraints

- Keep `Product.template_id` required.
- Keep the one-to-one relationship `Warranty.product_id -> Product.id`.
- Imported Warranties remain `DRAFT`; import must not activate them or set `start_date`/`end_date`.
- Do not regenerate or overwrite an existing Warranty code.
- Use the existing `GenerateWarrantyCodeUseCase`; do not create another code generator.
- Do not change Admin/Web UI or public activation behavior in this task.
- Do not stage or commit changes unless the user explicitly requests it.

---

## File Map

- Modify `apps/api/src/modules/products/use-cases/confirm-product-import.use-case.ts`
  - Inject the existing Warranty-code generator.
  - Generate a code for each newly imported Product.
  - Fill a missing code for an existing Product without overwriting an existing code.
- Modify `apps/api/src/modules/products/tests/confirm-product-import.use-case.spec.ts`
  - Cover new-row generation, legacy-null backfill, and existing-code preservation.
- Create `apps/api/scripts/backfill-missing-warranty-codes.ts`
  - Explicit one-time command for existing Warranty rows with `warranty_code = null`.
- Modify `apps/api/package.json`
  - Add an explicit development backfill script; do not run it automatically from migrations or startup.

### Task 1: Generate a Warranty code for newly imported Products

**Files:**

- Modify: `apps/api/src/modules/products/tests/confirm-product-import.use-case.spec.ts`
- Modify: `apps/api/src/modules/products/use-cases/confirm-product-import.use-case.ts`

**Interfaces:**

- Consumes: `GenerateWarrantyCodeUseCase.execute(date?: Date, tx?: Prisma.TransactionClient): Promise<string>`
- Produces: every newly imported Product has a nested Warranty with a non-null `warranty_code` and `status = DRAFT`

- [ ] **Step 1: Extend the existing unit-test setup with a Warranty-code generator mock**

Add:

```ts
const generateWarrantyCodeUseCase = {
  execute: jest.fn().mockResolvedValue("WM-2026-IMPORT01"),
};
```

Construct the use case with:

```ts
const useCase = new ConfirmProductImportUseCase(
  prismaService as never,
  generateProductCodeUseCase as never,
  generateWarrantyCodeUseCase as never,
);
```

- [ ] **Step 2: Add a failing assertion for the nested Warranty**

The existing “creates products from validated import rows” test must assert:

```ts
expect(tx.product.create).toHaveBeenCalledWith(
  expect.objectContaining({
    data: expect.objectContaining({
      warranty: {
        create: expect.objectContaining({
          warranty_code: "WM-2026-IMPORT01",
          status: "DRAFT",
          start_date: null,
          end_date: null,
          duration_months: 36,
          terms: "Template terms",
        }),
      },
    }),
  }),
);

expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledWith(
  expect.any(Date),
  tx,
);
```

- [ ] **Step 3: Run the focused test and confirm it fails**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/confirm-product-import.use-case.spec.ts
```

Expected: FAIL because `ConfirmProductImportUseCase` does not yet accept or call `GenerateWarrantyCodeUseCase`.

- [ ] **Step 4: Inject and use `GenerateWarrantyCodeUseCase`**

Add the import:

```ts
import { GenerateWarrantyCodeUseCase } from "@/modules/products/use-cases/generate-warranty-code.use-case";
```

Update the constructor:

```ts
constructor(
  private readonly prismaService: PrismaService,
  private readonly generateProductCodeUseCase: GenerateProductCodeUseCase,
  private readonly generateWarrantyCodeUseCase: GenerateWarrantyCodeUseCase,
) {}
```

Inside the transaction, capture one timestamp:

```ts
const importDate = new Date();
```

Before each new `tx.product.create`, generate the code using the same transaction:

```ts
const warrantyCode = await this.generateWarrantyCodeUseCase.execute(
  importDate,
  tx,
);
```

Set the nested Warranty value:

```ts
warranty: {
  create: {
    warranty_code: warrantyCode,
    duration_months: row.templateWarrantyDurationMonths,
    start_date: null,
    end_date: null,
    status: warranty_status.DRAFT,
    terms: row.templateWarrantyTerms,
  },
},
```

- [ ] **Step 5: Run the focused test**

Run the same Jest command.

Expected: PASS.

### Task 2: Preserve existing codes and fill missing codes on import updates

**Files:**

- Modify: `apps/api/src/modules/products/tests/confirm-product-import.use-case.spec.ts`
- Modify: `apps/api/src/modules/products/use-cases/confirm-product-import.use-case.ts`

**Interfaces:**

- Consumes: the imported row’s resolved `existingProductId`
- Produces: an existing Warranty keeps its current code; a Warranty with `null` code receives exactly one generated code

- [ ] **Step 1: Add a failing test for an update row whose Warranty code is null**

Mock an existing Product match and transaction Warranty:

```ts
tx.warranty.findUnique.mockResolvedValue({
  id: "warranty-id",
  warranty_code: null,
});
```

Expected calls:

```ts
expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledTimes(1);
expect(tx.warranty.update).toHaveBeenCalledWith({
  where: { id: "warranty-id" },
  data: { warranty_code: "WM-2026-IMPORT01" },
});
```

- [ ] **Step 2: Add a failing test for preserving an existing Warranty code**

Mock:

```ts
tx.warranty.findUnique.mockResolvedValue({
  id: "warranty-id",
  warranty_code: "WM-2026-EXISTING",
});
```

Expected:

```ts
expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
expect(tx.warranty.update).not.toHaveBeenCalled();
expect(tx.warranty.create).not.toHaveBeenCalled();
```

- [ ] **Step 3: Run the focused tests and confirm they fail**

Run the focused Jest command from Task 1.

Expected: FAIL because update imports currently execute `warranty.upsert({ update: {} })`.

- [ ] **Step 4: Replace `upsertDraftWarranty` with explicit ensure logic**

Use this behavior:

```ts
private async ensureDraftWarrantyCode(
  tx: Prisma.TransactionClient,
  productId: string,
  row: PreparedProductImportRow,
  importDate: Date,
) {
  const warranty = await tx.warranty.findUnique({
    where: { product_id: productId },
    select: { id: true, warranty_code: true },
  });

  if (warranty?.warranty_code) return;

  const warrantyCode = await this.generateWarrantyCodeUseCase.execute(
    importDate,
    tx,
  );

  if (warranty) {
    await tx.warranty.update({
      where: { id: warranty.id },
      data: { warranty_code: warrantyCode },
    });
    return;
  }

  await tx.warranty.create({
    data: {
      product_id: productId,
      warranty_code: warrantyCode,
      duration_months: row.templateWarrantyDurationMonths,
      start_date: null,
      end_date: null,
      status: warranty_status.DRAFT,
      terms: row.templateWarrantyTerms,
    },
  });
}
```

Call it only for the update branch:

```ts
await this.ensureDraftWarrantyCode(tx, product.id, row, importDate);
```

- [ ] **Step 5: Run the focused tests**

Expected: all confirm-import tests PASS.

### Task 3: Add an explicit backfill command for existing data

**Files:**

- Create: `apps/api/scripts/backfill-missing-warranty-codes.ts`
- Modify: `apps/api/package.json`

**Interfaces:**

- Consumes: Warranty rows where `warranty_code = null`
- Produces: a unique generated code for each matching row; does not alter Warranty status, dates, duration, terms, owner, or Product

- [ ] **Step 1: Create the backfill script**

The script must:

1. Start a Nest application context from `AppModule`.
2. Resolve `PrismaService` and `GenerateWarrantyCodeUseCase`.
3. Fetch only Warranty IDs whose code is null.
4. Process each Warranty in a transaction.
5. Re-read the row inside the transaction and skip it if another process already populated the code.
6. Generate with `GenerateWarrantyCodeUseCase.execute(new Date(), tx)`.
7. Update only `warranty_code`.
8. Print counts for `found`, `updated`, and `skipped`.
9. Close the Nest application context in `finally`.

The transaction body must follow:

```ts
const current = await tx.warranty.findUnique({
  where: { id: warranty.id },
  select: { warranty_code: true },
});

if (!current || current.warranty_code) {
  skipped += 1;
  return;
}

const warrantyCode = await generator.execute(new Date(), tx);
await tx.warranty.update({
  where: { id: warranty.id },
  data: { warranty_code: warrantyCode },
});
updated += 1;
```

- [ ] **Step 2: Add a development-only package command**

Add:

```json
"db:backfill-warranty-codes:dev": "dotenv -e ../../.env.development -- ts-node scripts/backfill-missing-warranty-codes.ts"
```

Do not attach this command to `postinstall`, application startup, migration, or seed.

- [ ] **Step 3: Type-check before running any database mutation**

Run:

```powershell
pnpm.cmd --filter @repo/api check-types
```

Expected: exit code 0.

- [ ] **Step 4: Run the backfill only after explicit user approval**

Run:

```powershell
pnpm.cmd --filter @repo/api db:backfill-warranty-codes:dev
```

Expected: the script reports the number of null codes updated. A second run reports zero updates and is idempotent.

### Task 4: Regression verification

**Files:**

- Test: `apps/api/src/modules/products/tests/confirm-product-import.use-case.spec.ts`
- Existing regression suites only; no new production files

**Interfaces:**

- Consumes: completed Tasks 1–3
- Produces: evidence that import behavior works without changing activation semantics

- [ ] **Step 1: Run Product import tests**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/product-excel-import.use-case.spec.ts src/modules/products/tests/confirm-product-import.use-case.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run Product creation and Warranty activation regressions**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/create-product.use-case.spec.ts src/modules/warranties/tests/activate-warranty.use-case.spec.ts src/modules/warranty-activation-requests/tests/create-warranty-activation-request.use-case.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Run API type-check and lint**

```powershell
pnpm.cmd --filter @repo/api check-types
pnpm.cmd --filter @repo/api lint
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Manually verify a two-row import**

Import two rows using one active `templateSku`, two distinct serials, blank Product codes, and `ACTIVE` status.

Expected for each Product:

```text
product_code: generated and unique
serial_number: matches the Excel row
template_id: points to the selected ProductTemplate
warranty.status: DRAFT
warranty.warranty_code: generated, non-null, and unique
warranty.start_date: null
warranty.end_date: null
```

- [ ] **Step 5: Review the working tree without staging or committing**

```powershell
git status --short
git diff -- apps/api/src/modules/products/use-cases/confirm-product-import.use-case.ts apps/api/src/modules/products/tests/confirm-product-import.use-case.spec.ts apps/api/scripts/backfill-missing-warranty-codes.ts apps/api/package.json
```

Expected: only the planned files are changed for this task.
