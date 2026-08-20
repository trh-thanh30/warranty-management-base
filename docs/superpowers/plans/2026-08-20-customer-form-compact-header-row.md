# Customer Form Compact Header Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the empty desktop grid cell introduced by the Customer birthdate field without changing mobile layout or form behavior.

**Architecture:** Keep the existing `CustomerForm` and controls. Compose full name, customer code, and birthdate in one responsive 12-column row on `sm` screens and above; retain one-column stacking below `sm`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Node test runner.

## Global Constraints

- Do not change form data, validation, submission, or API behavior.
- Mobile fields remain one per row.
- Do not create a shared component for this one-off layout.
- Do not commit without explicit user permission.

---

### Task 1: Compact the Customer identity fields

**Files:**

- Modify: `apps/admin/src/views/customers/components/customer-form.tsx`
- Test: `apps/admin/src/views/customers/customer-birthdate-form.test.ts`

**Interfaces:**

- Consumes: Existing `FormField`, `Input`, and `DatePicker` controls.
- Produces: A responsive identity row using `sm:grid-cols-12`, with full name spanning 5 columns, customer code 3 columns, and birthdate 4 columns.

- [ ] **Step 1: Write the failing layout regression test**

Assert that the form source contains the responsive 12-column identity grid and the three agreed column spans.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `pnpm --filter @repo/admin test -- customer-birthdate-form.test.ts`

Expected: FAIL because the form still uses separate two-column rows.

- [ ] **Step 3: Implement the minimal responsive grid change**

Move the existing birthdate field into the identity grid and add only layout classes: `sm:grid-cols-12`, `sm:col-span-5`, `sm:col-span-3`, and `sm:col-span-4`.

- [ ] **Step 4: Verify GREEN and lint**

Run:

```cmd
pnpm --filter @repo/admin test -- customer-birthdate-form.test.ts
pnpm --filter @repo/admin lint
pnpm --filter @repo/admin check-types
```

Expected: all commands exit successfully.
