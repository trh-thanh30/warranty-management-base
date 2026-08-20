# Film Activation Field Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed the seven Film `PRODUCT_SELECT` activation fields on a freshly reset database without overwriting an existing Admin configuration.

**Architecture:** Keep the default Film field definition and initialization behavior in `prisma/seed-categories.ts`, next to ownership of the Film category seed. The seed checks whether relational fields already exist; when none exist it atomically enables the form and creates all seven fields.

**Tech Stack:** TypeScript, Prisma Client, PostgreSQL, Jest.

## Global Constraints

- Preserve existing relational activation configuration and enablement.
- Initialize all seven fields atomically and without static options.
- Do not change runtime warranty activation business rules.
- Execute inline and sequentially on the current branch.

---

### Task 1: Seed default Film activation fields

**Files:**

- Modify: `apps/api/prisma/seed-categories.ts`
- Create: `apps/api/src/modules/categories/tests/seed-categories.spec.ts`

**Interfaces:**

- Produces: `filmActivationFieldSeeds`, the ordered seven-field definition.
- Produces: `seedLexzenzProductCategories(client)`, extended to initialize Film fields only when none exist.

- [ ] **Step 1: Write failing seed tests**

Add tests that provide a mocked Prisma-compatible client and assert:

```ts
expect(filmActivationFieldSeeds).toHaveLength(7);
expect(filmActivationFieldSeeds.map((field) => field.key)).toEqual([
  "windshield",
  "frontLeftSide",
  "frontRightSide",
  "rearLeftSide",
  "rearRightSide",
  "rearGlass",
  "sunroof",
]);
expect(createdFields).toEqual(
  filmActivationFieldSeeds.map((field, index) =>
    expect.objectContaining({ ...field, sort_order: index + 1 }),
  ),
);
```

Add a second test where `count()` returns `1` and assert that neither the category enablement nor field creation is called.

- [ ] **Step 2: Verify RED**

Run:

```bash
pnpm --filter @repo/api exec jest --runInBand src/modules/categories/tests/seed-categories.spec.ts
```

Expected: FAIL because `filmActivationFieldSeeds` and relational initialization do not exist.

- [ ] **Step 3: Implement minimal atomic initialization**

In `seed-categories.ts`:

```ts
export const filmActivationFieldSeeds = [
  { key: "windshield", label: "Kính lái" },
  { key: "frontLeftSide", label: "Kính sườn trước - trái" },
  { key: "frontRightSide", label: "Kính sườn trước - phải" },
  { key: "rearLeftSide", label: "Kính sườn sau - trái" },
  { key: "rearRightSide", label: "Kính sườn sau - phải" },
  { key: "rearGlass", label: "Kính lưng" },
  { key: "sunroof", label: "Cửa sổ trời" },
] as const;
```

After upserting the Film category, run a transaction that counts existing relational fields. If the count is zero, update `activation_form_enabled` to `true` and create all seven fields with `type: "PRODUCT_SELECT"`, ordered from 1 through 7. If the count is non-zero, return without writing.

- [ ] **Step 4: Verify GREEN and regressions**

Run:

```bash
pnpm --filter @repo/api exec jest --runInBand src/modules/categories/tests/seed-categories.spec.ts src/modules/categories/tests/category-activation-fields.use-case.spec.ts
pnpm --filter @repo/api check-types
pnpm --filter @repo/api lint
```

Expected: all tests and typecheck pass; lint exits with zero errors while existing warnings remain unchanged.

- [ ] **Step 5: Verify reset database behavior**

After the user-authorized local reset, run the development category seed and query the Film category. Expected: `activation_form_enabled = true`, relational field count `= 7`, and every field type is `PRODUCT_SELECT`.

- [ ] **Step 6: Commit verified implementation**

```bash
git add apps/api/prisma/seed-categories.ts apps/api/src/modules/categories/tests/seed-categories.spec.ts docs/superpowers/plans/2026-08-16-film-activation-field-seed.md
git commit -m "fix(categories): seed film activation fields"
```
