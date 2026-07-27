# Edit Product Warranty Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow Admin users to replace a Product warranty code only while the Warranty is draft and no activation request is open.

**Architecture:** The API computes an edit capability from Warranty status and open activation requests, exposes it through the shared Product contract, and enforces the same rule in `UpdateProductUseCase`. The Admin form consumes the capability for its disabled state while the backend remains authoritative.

**Tech Stack:** NestJS, Prisma, Jest, Next.js, React Hook Form, Zod, TypeScript

## Global Constraints

- Do not change the Prisma schema.
- Do not add a migration or modify seed data.
- Product create continues to generate warranty codes automatically.
- Blank, omitted, and unchanged values preserve the existing code.
- Do not stage or commit without explicit user instruction.

---

### Task 1: Expose warranty-code edit capability

**Files:**

- Modify: `packages/shared/src/types/product.types.ts`
- Modify: `apps/api/src/modules/products/repository/products.repository.ts`
- Modify: `apps/api/src/modules/products/products.types.ts`
- Modify: `apps/api/src/modules/products/tests/product-response.mapper.spec.ts`
- Create: `apps/api/src/modules/products/tests/products.repository.spec.ts`

**Interfaces:**

- Produces: `WarrantyCodeEditLockedReason`
- Produces: `ProductSummary.canEditWarrantyCode`
- Produces: `ProductSummary.warrantyCodeEditLockedReason`

- [ ] **Step 1: Add failing mapper and repository tests**

Assert that Product responses map:

```ts
{ status: warranty_status.DRAFT, openRequests: [] }
// => canEditWarrantyCode: true, reason: null

{ status: warranty_status.ACTIVE, openRequests: [] }
// => canEditWarrantyCode: false, reason: "WARRANTY_NOT_DRAFT"

{ status: warranty_status.DRAFT, openRequests: [{ id: "request-id" }] }
// => canEditWarrantyCode: false, reason: "OPEN_ACTIVATION_REQUEST"
```

Assert `ProductsRepository.findById` selects at most one
`warranty_activation_requests` relation whose status is `PENDING` or
`APPROVED`.

- [ ] **Step 2: Run tests and verify RED**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/product-response.mapper.spec.ts src/modules/products/tests/products.repository.spec.ts
```

Expected: FAIL because the relation and capability fields do not exist.

- [ ] **Step 3: Implement contract and mapper**

Add:

```ts
export type WarrantyCodeEditLockedReason =
  | "WARRANTY_NOT_DRAFT"
  | "OPEN_ACTIVATION_REQUEST";
```

Add required capability fields to `ProductSummary`. Extend `productInclude`
with:

```ts
warranty_activation_requests: {
  where: { status: { in: ["PENDING", "APPROVED"] } },
  select: { id: true },
  take: 1,
}
```

Compute the locked reason in `toProductResponse`, prioritizing a non-draft
Warranty over an open request. A missing Warranty is editable unless an open
request exists.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

---

### Task 2: Enforce replacement rules in Product update

**Files:**

- Modify: `packages/shared/src/types/product.types.ts`
- Modify: `apps/api/src/modules/products/dto/update-product.dto.ts`
- Modify: `apps/api/src/modules/products/use-cases/update-product.use-case.ts`
- Modify: `apps/api/src/modules/products/tests/update-product.use-case.spec.ts`

**Interfaces:**

- Consumes: `UpdateProductDto.warrantyCode?: string`
- Produces: normalized uppercase warranty-code replacement or a no-op.

- [ ] **Step 1: Add failing use-case tests**

Cover:

1. Omitted value preserves an existing code.
2. Blank value preserves an existing code.
3. Same normalized value is a no-op.
4. A valid unique replacement is uppercased and stored.
5. A duplicate replacement throws `Warranty code already exists`.
6. A replacement for `ACTIVE`, `EXPIRED`, or `VOIDED` Warranty is rejected.
7. A replacement with an open `PENDING` or `APPROVED` request is rejected.
8. A replacement creates a draft Warranty for legacy Product data with no
   Warranty.
9. Missing legacy code still auto-generates when no replacement is supplied.

- [ ] **Step 2: Run update tests and verify RED**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/update-product.use-case.spec.ts
```

Expected: FAIL because `warrantyCode` is ignored and no edit guards exist.

- [ ] **Step 3: Implement validation and update orchestration**

Add optional DTO/shared field:

```ts
warrantyCode?: string;
```

Allow a blank input at the DTO boundary and perform business normalization in
the use case:

```ts
const requestedCode = dto.warrantyCode?.trim().toUpperCase() || null;
const currentCode = existingProduct.warranty?.warranty_code ?? null;
const isReplacement = requestedCode !== null && requestedCode !== currentCode;
```

For replacements:

- Validate `/^[A-Z0-9-]{6,64}$/`.
- Require Warranty missing or `DRAFT`.
- Require no included open activation request.
- Check `ProductsRepository.findByWarrantyCode`.
- Update the existing Warranty or create a draft Warranty from template
  defaults.

For blank, omitted, or unchanged values, preserve an existing code. If legacy
data has no code, retain the current generator behavior.

- [ ] **Step 4: Run update tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

---

### Task 3: Add the editable Admin form field

**Files:**

- Modify: `apps/admin/src/views/products/products.types.ts`
- Modify: `apps/admin/src/views/products/products.utils.ts`
- Modify: `apps/admin/src/views/products/products.utils.test.ts`
- Modify: `apps/admin/src/views/products/hooks/use-product-form.ts`
- Modify: `apps/admin/src/views/products/components/product-form.tsx`
- Modify: Admin VI and EN message files containing the `Products` namespace

**Interfaces:**

- Consumes: Product response capability fields.
- Produces: `UpdateProductBody.warrantyCode`.

- [ ] **Step 1: Add failing form mapping tests**

Assert:

```ts
toUpdateProductBody(valuesWithWarrantyCode, metadata).warrantyCode;
// => "wm-2026-new001" (backend owns uppercase normalization)
```

Validate that blank values are accepted and invalid non-empty values are
rejected by the form schema.

- [ ] **Step 2: Run Admin product utility tests and verify RED**

```powershell
pnpm.cmd --filter @repo/admin test -- products.utils.test.ts
```

Expected: FAIL because the field is absent from schema/defaults/payload.

- [ ] **Step 3: Implement form state and UI**

- Add `warrantyCode` to `productFormSchema`.
- Initialize it from `product.warrantyCode`.
- Include it only in `toUpdateProductBody`; never include it in create.
- Replace the read-only display with a registered input on edit.
- Disable the input when `product.canEditWarrantyCode` is false.
- Use `Field.description` for translated lock explanations.
- Map duplicate, invalid, non-draft, and open-request backend messages to the
  `warrantyCode` field.

- [ ] **Step 4: Run Admin tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

---

### Task 4: Verify API and Admin

**Files:**

- Verify all files listed above.

**Interfaces:**

- Produces: regression evidence for API behavior and Admin contract use.

- [ ] **Step 1: Run focused API tests**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/products/tests/product-response.mapper.spec.ts src/modules/products/tests/products.repository.spec.ts src/modules/products/tests/update-product.use-case.spec.ts src/modules/products/tests/create-product.use-case.spec.ts src/modules/products/tests/confirm-product-import.use-case.spec.ts
```

- [ ] **Step 2: Run Admin tests**

```powershell
pnpm.cmd --filter @repo/admin test
```

- [ ] **Step 3: Run type checking**

```powershell
pnpm.cmd --filter @repo/api check-types
pnpm.cmd --filter @repo/admin check-types
```

- [ ] **Step 4: Inspect diff**

```powershell
git diff --check
git status --short
git diff -- apps/api/src/modules/products apps/admin/src/views/products packages/shared/src/types/product.types.ts
```

Expected: no schema, migration, or seed changes.
