# Warranty Lookup Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicated native warranty lookup forms with one accessible,
validated shadcn-style form shared by the lookup page and modal.

**Architecture:** A localized schema factory validates and normalizes the
E-Warranty code. `WarrantyLookupForm` owns React Hook Form state and renders
the existing form primitives, while its parents retain API mutation and result
state.

**Tech Stack:** Next.js, React, TypeScript, React Hook Form, Zod,
`@hookform/resolvers`, shadcn-style form primitives, Tailwind CSS, Node test
runner.

## Global Constraints

- Do not change the warranty lookup API contract.
- Do not add dependencies.
- Preserve page and modal responsive layouts.
- Use existing `@repo/ui` primitives and app form components.
- Clear lookup result state when the user edits the code.

---

### Task 1: Schema And Shared Form

**Files:**

- Create: `apps/web/src/components/common/warranty-lookup-form.schema.ts`
- Create: `apps/web/src/components/common/warranty-lookup-form.tsx`
- Create: `apps/web/tests/warranty-lookup-form.test.mjs`

**Interfaces:**

- Produces:
  `createWarrantyLookupFormSchema(messages): ZodObject`
- Produces:
  `WarrantyLookupForm(props): ReactElement`
- The form calls `onSubmit(code: string)` only with a trimmed valid code.

- [x] **Step 1: Write failing schema and architecture tests**

Test accepted trimmed codes, required/minimum/maximum/format failures, and
assert that both lookup entry points import `WarrantyLookupForm`.

- [x] **Step 2: Run the focused test and verify RED**

Run:
`node --import tsx --test apps/web/tests/warranty-lookup-form.test.mjs`

Expected: FAIL because the schema and shared form do not exist.

- [x] **Step 3: Implement the schema and form**

Use `z.string().trim().min(6).max(64).regex(/^[A-Za-z0-9-]+$/)`,
`useForm`, `zodResolver`, `FormField`, `FormControl`, `FormMessage`, `Input`,
and `Button`. Support `page` and `modal` variants through a typed prop.

- [x] **Step 4: Run the focused test and verify GREEN**

Run:
`node --import tsx --test apps/web/tests/warranty-lookup-form.test.mjs`

Expected: all tests pass.

### Task 2: Integrate Both Lookup Entry Points

**Files:**

- Modify: `apps/web/src/views/warranty/lookup.view.tsx`
- Modify: `apps/web/src/components/warranty-lookup-modal.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes:
  `WarrantyLookupForm({ variant, initialValue, isPending, onSubmit, onValueChange })`
- Parents continue using `useWarrantyLookup`.

- [x] **Step 1: Replace page-local input state and native form**

Render `WarrantyLookupForm` with `variant="page"`, call `lookup` on valid
submit, and call `reset` when the value changes.

- [x] **Step 2: Replace modal-local input state and native form**

Render `WarrantyLookupForm` with `variant="modal"` and `initialValue`.
Preserve automatic lookup when a non-empty initial query is supplied.

- [x] **Step 3: Add localized validation messages**

Add required, length, and format messages under both warranty lookup message
namespaces in Vietnamese and English.

- [x] **Step 4: Run verification**

Run:

- `pnpm.cmd --filter @repo/web test`
- `pnpm.cmd --filter @repo/web exec eslint src/components/common/warranty-lookup-form.tsx src/components/common/warranty-lookup-form.schema.ts src/components/warranty-lookup-modal.tsx src/views/warranty/lookup.view.tsx`
- `pnpm.cmd --filter @repo/web check-types`
- `pnpm.cmd exec prettier --check apps/web/src/components/common/warranty-lookup-form.tsx apps/web/src/components/common/warranty-lookup-form.schema.ts apps/web/src/components/warranty-lookup-modal.tsx apps/web/src/views/warranty/lookup.view.tsx apps/web/src/messages/vi.json apps/web/src/messages/en.json`
- `git diff --check`

Expected: focused tests, ESLint, Prettier, and diff check pass. If the Web
type-check remains blocked by existing `packages/ui` dependency errors, verify
that no warranty lookup file appears in its diagnostics and report the blocker.
