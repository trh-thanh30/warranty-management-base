# Product Warranty Duration Override Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make template warranty duration optional while requiring and persisting an independently editable duration for every physical product.

**Architecture:** `ProductTemplate.defaultWarrantyDurationMonths` becomes a nullable form default; `Warranty.durationMonths` remains the required product snapshot. Product use cases enforce creation and draft-only editing; activated warranties continue through the reason-required warranty adjustment flow.

**Tech Stack:** Prisma/PostgreSQL, NestJS/class-validator, Next.js/React Hook Form/Zod, next-intl, Node test runner, Jest, pnpm/Turborepo.

## Global Constraints

- Work inline and sequentially on the current branch; no subagents or parallel tasks.
- Commit each verified task separately.
- Valid duration is an integer from 1 upward, with no 120-month maximum.
- Template changes never rewrite existing product warranties.
- Product edit changes duration only while warranty status is `DRAFT`.
- Do not commit generated changes to `apps/admin/next-env.d.ts`.

---

### Task 1: Nullable template duration contract

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260816150000_make_template_warranty_duration_optional/migration.sql`
- Modify: `packages/shared/src/types/product.types.ts`
- Modify: `apps/api/src/modules/product-templates/dto/create-product-template.dto.ts`
- Modify: `apps/api/src/modules/product-templates/use-cases/create-product-template.use-case.ts`
- Test: `apps/api/src/modules/product-templates/tests/product-template-write.use-cases.spec.ts`
- Test: `apps/api/src/modules/warranties/tests/warranty-duration.dto.spec.ts`

**Interfaces:**

- Produces: `ProductTemplateSummary.defaultWarrantyDurationMonths: number | null`
- Produces: template create/update bodies accepting `number | null`
- Preserves: `Warranty.durationMonths: number`

- [ ] **Step 1: Write failing tests**

Add a DTO test accepting null:

```ts
const dto = Object.assign(new CreateProductTemplateDto(), {
  categoryId: "62a67f1c-4e8b-45a6-ac07-dfeaf40f1244",
  name: "Template without default duration",
  defaultWarrantyDurationMonths: null,
});
expect(await validate(dto)).toHaveLength(0);
```

Add a create-use-case assertion:

```ts
expect(repository.create).toHaveBeenCalledWith(
  expect.objectContaining({ default_warranty_duration_months: null }),
);
```

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
pnpm --filter @repo/api exec jest src/modules/warranties/tests/warranty-duration.dto.spec.ts src/modules/product-templates/tests/product-template-write.use-cases.spec.ts --runInBand
```

Expected: create use case still substitutes 36 or type contracts reject null.

- [ ] **Step 3: Implement nullable database and API contract**

Prisma:

```prisma
default_warranty_duration_months Int?
```

Migration:

```sql
ALTER TABLE "product_template"
ALTER COLUMN "default_warranty_duration_months" DROP DEFAULT,
ALTER COLUMN "default_warranty_duration_months" DROP NOT NULL;
```

DTO and use case:

```ts
@IsOptional()
@IsInt()
@Min(1)
defaultWarrantyDurationMonths?: number | null;
```

```ts
default_warranty_duration_months:
  dto.defaultWarrantyDurationMonths ?? null,
```

Update shared response/body fields to `number | null`.

- [ ] **Step 4: Generate and verify**

```powershell
pnpm --filter @repo/api prisma:generate
pnpm --filter @repo/api exec jest src/modules/warranties/tests/warranty-duration.dto.spec.ts src/modules/product-templates/tests/product-template-write.use-cases.spec.ts --runInBand
pnpm --filter @repo/shared build
pnpm --filter @repo/api check-types
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```powershell
git add -- apps/api/prisma/schema.prisma apps/api/prisma/migrations/20260816150000_make_template_warranty_duration_optional/migration.sql packages/shared/src/types/product.types.ts apps/api/src/modules/product-templates apps/api/src/modules/warranties/tests/warranty-duration.dto.spec.ts
git commit -m "feat(warranty): make template duration optional"
```

### Task 2: Optional duration in Admin template form

**Files:**

- Modify: `apps/admin/src/views/product-templates/product-templates.types.ts`
- Modify: `apps/admin/src/views/product-templates/product-templates.utils.ts`
- Modify: `apps/admin/src/views/product-templates/product-templates.utils.test.ts`
- Modify: `apps/admin/src/views/product-templates/components/product-template-form.tsx`
- Modify: `apps/admin/src/views/product-templates/components/product-templates-table.tsx`
- Modify: `apps/admin/src/views/product-templates/components/product-template-summary-card.tsx`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`

**Interfaces:**

- Consumes: nullable template default
- Produces: `ProductTemplateFormValues.defaultWarrantyDurationMonths: number | null`

- [ ] **Step 1: Write failing Admin tests**

```ts
test("allows a blank template warranty duration", () => {
  const parsed = productTemplateFormSchema.safeParse({
    ...formValues,
    defaultWarrantyDurationMonths: "",
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal(parsed.data.defaultWarrantyDurationMonths, null);
  assert.equal(
    toCreateTemplateBody(parsed.data).defaultWarrantyDurationMonths,
    null,
  );
});
```

Also assert edit defaults map a null duration to an empty input rather than 36.

- [ ] **Step 2: Run test and verify RED**

```powershell
pnpm --dir apps/admin exec tsx --test src/views/product-templates/product-templates.utils.test.ts
```

Expected: blank currently coerces to 0 and null defaults to 36.

- [ ] **Step 3: Implement nullable form parsing and UI**

```ts
const optionalWarrantyDuration = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  z.union([
    z.null(),
    z.coerce.number().int("durationMonthsRange").min(1, "durationMonthsRange"),
  ]),
);
```

Use `template?.defaultWarrantyDurationMonths ?? ""`, send null through create/update bodies, add localized help text, and display `-` for null in table/summary.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --dir apps/admin exec tsx --test src/views/product-templates/product-templates.utils.test.ts
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin lint
git add -- apps/admin/src/views/product-templates apps/admin/src/messages/vi.json apps/admin/src/messages/en.json
git commit -m "feat(admin): allow blank template warranty duration"
```

Expected: all commands exit 0; restore generated `apps/admin/next-env.d.ts` before commit if changed.

### Task 3: Product-level duration API

**Files:**

- Modify: `packages/shared/src/types/product.types.ts`
- Modify: `apps/api/src/modules/products/dto/create-product.dto.ts`
- Modify: `apps/api/src/modules/products/dto/update-product.dto.ts`
- Modify: `apps/api/src/modules/products/use-cases/create-product.use-case.ts`
- Modify: `apps/api/src/modules/products/use-cases/update-product.use-case.ts`
- Test: `apps/api/src/modules/products/tests/create-product.use-case.spec.ts`
- Test: `apps/api/src/modules/products/tests/update-product.use-case.spec.ts`

**Interfaces:**

- Produces: `CreateProductBody.warrantyDurationMonths: number`
- Produces: `UpdateProductBody.warrantyDurationMonths?: number`
- Produces detail codes `WARRANTY_DURATION_REQUIRED` and `WARRANTY_DURATION_NOT_DRAFT`

- [ ] **Step 1: Write failing create/update tests**

Create assertion:

```ts
await useCase.execute({
  templateId: template.id,
  warrantyDurationMonths: 180,
});
expect(productCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    data: expect.objectContaining({
      warranty: {
        create: expect.objectContaining({ duration_months: 180 }),
      },
    }),
  }),
);
```

Draft update assertion:

```ts
await useCase.execute("product-id", { warrantyDurationMonths: 60 });
expect(repository.update).toHaveBeenCalledWith(
  "product-id",
  expect.objectContaining({
    warranty: { update: expect.objectContaining({ duration_months: 60 }) },
  }),
);
```

Add a non-draft case expecting details code `WARRANTY_DURATION_NOT_DRAFT`, and preserve the test proving template replacement does not overwrite an existing warranty duration.

- [ ] **Step 2: Run tests and verify RED**

```powershell
pnpm --filter @repo/api exec jest src/modules/products/tests/create-product.use-case.spec.ts src/modules/products/tests/update-product.use-case.spec.ts --runInBand
```

- [ ] **Step 3: Add contracts, validation, and business rules**

Create DTO:

```ts
@IsInt()
@Min(1)
warrantyDurationMonths: number;
```

Update DTO uses the same validators plus `@IsOptional()`.

Create use case stores `dto.warrantyDurationMonths`. Draft updates merge duration with any warranty-code update. Reject a non-draft change with:

```ts
throw new BadRequestError(
  "Warranty duration can only be changed while warranty is draft",
  "BAD_REQUEST",
  { code: "WARRANTY_DURATION_NOT_DRAFT" },
);
```

If a legacy product lacks a warranty, resolve duration from submitted value then non-null template default; otherwise return detail code `WARRANTY_DURATION_REQUIRED`.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --filter @repo/api exec jest src/modules/products/tests/create-product.use-case.spec.ts src/modules/products/tests/update-product.use-case.spec.ts --runInBand
pnpm --filter @repo/shared build
pnpm --filter @repo/api check-types
pnpm --filter @repo/api lint
git add -- packages/shared/src/types/product.types.ts apps/api/src/modules/products
git commit -m "feat(products): persist individual warranty duration"
```

Expected: all commands exit 0; pre-existing API warnings are acceptable only with exit 0.

### Task 4: Product duration input in Admin

**Files:**

- Modify: `apps/admin/src/views/products/products.types.ts`
- Modify: `apps/admin/src/views/products/products.utils.ts`
- Modify: `apps/admin/src/views/products/products.utils.test.ts`
- Modify: `apps/admin/src/views/products/hooks/use-product-form.ts`
- Modify: `apps/admin/src/views/products/components/product-form.tsx`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`

**Interfaces:**

- Consumes: nullable template default and `product.warranty.durationMonths`
- Produces: product create/update requests containing `warrantyDurationMonths`

- [ ] **Step 1: Write failing schema and mapper tests**

```ts
assert.equal(
  productFormSchema.safeParse({
    ...values,
    warrantyDurationMonths: "",
  }).success,
  false,
);
assert.equal(
  productFormSchema.safeParse({
    ...values,
    warrantyDurationMonths: 180,
  }).success,
  true,
);
```

Assert create/update mappers include the numeric duration.

- [ ] **Step 2: Run test and verify RED**

```powershell
pnpm --dir apps/admin exec tsx --test src/views/products/products.utils.test.ts
```

- [ ] **Step 3: Add field, defaults, prefill, and lock**

Schema:

```ts
warrantyDurationMonths: z.coerce
  .number()
  .int("durationMonthsRange")
  .min(1, "durationMonthsRange"),
```

Default:

```ts
warrantyDurationMonths:
  product?.warranty?.durationMonths ??
  template?.defaultWarrantyDurationMonths ??
  "",
```

During template change, prefill only while creating:

```ts
if (creating) {
  setValue(
    "warrantyDurationMonths",
    selectedTemplate.defaultWarrantyDurationMonths ?? "",
    { shouldDirty: true, shouldValidate: true },
  );
}
```

Render a numeric input with `min={1}`, no max, and disable it when editing a product whose warranty is non-draft. Add Vietnamese/English descriptions and field errors, including `WARRANTY_DURATION_NOT_DRAFT`.

- [ ] **Step 4: Verify and commit**

```powershell
pnpm --dir apps/admin exec tsx --test src/views/products/products.utils.test.ts
pnpm --filter @repo/admin test
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin lint
git add -- apps/admin/src/views/products apps/admin/src/messages/vi.json apps/admin/src/messages/en.json
git commit -m "feat(admin): edit product warranty duration"
```

Expected: all commands exit 0; restore generated `apps/admin/next-env.d.ts` before commit if changed.

### Task 5: Final migration and cross-package verification

**Files:**

- Verification only unless a command identifies a defect in Tasks 1-4.

- [ ] **Step 1: Validate Prisma without resetting data**

```powershell
pnpm --filter @repo/api prisma:generate
pnpm --filter @repo/api prisma:validate
```

- [ ] **Step 2: Run tests sequentially**

```powershell
pnpm --filter @repo/api test -- --runInBand
pnpm --filter @repo/admin test
```

- [ ] **Step 3: Run builds/typechecks sequentially**

```powershell
pnpm --filter @repo/shared build
pnpm --filter @repo/api check-types
pnpm --filter @repo/admin check-types
```

- [ ] **Step 4: Run lint sequentially**

```powershell
pnpm --filter @repo/api lint
pnpm --filter @repo/admin lint
```

- [ ] **Step 5: Inspect final state**

```powershell
git status --short
git log --oneline -6
```

Expected: no uncommitted files and separate commits for design, plan, template contract, template UI, product API, and product UI.

## Manual Acceptance Flow

1. Create a template with blank duration; list/detail show `-`.
2. Create a product from that template; submit requires a duration.
3. Enter 180; created product stores 180.
4. Select a template defaulting to 120; change product duration to 60 and create.
5. Edit the draft product from 60 to 72.
6. Activate its warranty; product form locks duration and directs adjustment through Warranty.
7. Change template default; existing products retain their durations.
