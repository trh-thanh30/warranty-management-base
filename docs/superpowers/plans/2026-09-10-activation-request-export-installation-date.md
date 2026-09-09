# Activation Request Export Installation Date Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the optional installation timestamp to the warranty activation request Excel export.

**Architecture:** The Prisma `WarrantyActivationRequest` record already contains `installed_at`, so no query, API, or database changes are required. Extend the export row contract, map the existing field, add one schema column, and format that Excel column as a native date-time value.

**Tech Stack:** NestJS, Prisma, ExcelJS, Jest.

## Global Constraints

- Place `Ngày thi công` after `Năm sản xuất` in the exported workbook.
- Export the native Excel date-time with `dd/mm/yyyy hh:mm` format.
- Preserve `null` as an empty Excel cell.
- Do not add an import flow, migration, API endpoint, or admin UI change.
- Do not create a git commit unless explicitly requested by the user.

---

### Task 1: Map and format the installation date export column

**Files:**

- Modify: `apps/api/src/modules/warranty-activation-requests/excel/warranty-activation-request-excel.types.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/excel/warranty-activation-request-excel.mapper.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/excel/warranty-activation-request-excel.schema.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/excel/warranty-activation-request-workbook.factory.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/tests/export-warranty-activation-requests.use-case.spec.ts`

**Interfaces:**

- Consumes: `WarrantyActivationRequestExportRecord.installed_at: Date | null` from Prisma.
- Produces: `WarrantyActivationRequestExcelRow.installedAt: Date | null`, exported under the `Ngày thi công` column.

- [ ] **Step 1: Write the failing mapper test**

Extend the fixture with `installed_at: new Date('2026-07-21T08:30:00.000Z')` and the existing `expect.objectContaining` assertion with:

```ts
installedAt: new Date('2026-07-21T08:30:00.000Z'),
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @repo/api test -- export-warranty-activation-requests.use-case.spec.ts
```

Expected: the mapper assertion fails because `installedAt` is absent from the Excel row.

- [ ] **Step 3: Extend the export row and mapper**

Add the nullable property and map it without conversion:

```ts
// warranty-activation-request-excel.types.ts
installedAt: Date | null;

// warranty-activation-request-excel.mapper.ts
installedAt: request.installed_at,
```

- [ ] **Step 4: Add the workbook column and date-time format**

Add this schema entry immediately after `manufactureYear`:

```ts
{ key: 'installedAt', header: 'Ngày thi công', width: 22 },
```

Include `installedAt` in the workbook date-time formatting loop:

```ts
["installedAt", "reviewedAt", "createdAt", "updatedAt"].forEach((key) => {
  worksheet.getColumn(key).numFmt = "dd/mm/yyyy hh:mm";
});
```

- [ ] **Step 5: Run focused test to verify it passes**

Run:

```bash
pnpm --filter @repo/api test -- export-warranty-activation-requests.use-case.spec.ts
```

Expected: the export mapper test passes and the workbook is generated.

- [ ] **Step 6: Run API verification**

Run:

```bash
pnpm --filter @repo/api lint
pnpm --filter @repo/api check-types
pnpm --filter @repo/api test
pnpm --filter @repo/api build
git diff --check
```

Expected: all commands exit with status 0 and the diff contains only the export column, mapping, test, and planning documents.
