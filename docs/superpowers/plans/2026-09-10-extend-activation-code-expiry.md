# Activation Code Expiry Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permissioned quick actions that extend one activation code or every eligible code in a batch by a custom number of calendar months, with live expiry preview and detailed bulk results.

**Architecture:** Shared contracts define the request/result shapes and a dedicated permission. NestJS controllers call focused use cases; repository transactions perform guarded updates and return mutually exclusive skip counts. Admin reuses one expiry-extension dialog for batch and code actions, while both code contexts inherit the action from the shared `ActivationCodeDetailView` table.

**Tech Stack:** NestJS, Prisma/PostgreSQL, Next.js, React, TanStack Query, next-intl, shadcn-style `@repo/ui`, Jest, Node test runner.

## Global Constraints

- Extension months must be an integer from 1 through 120.
- New expiry is calculated from the current expiry, not from now.
- Calendar-month addition preserves time and clamps invalid month-end dates.
- A code is ineligible when `expiresAt <= now`, or status is `ACTIVATED` or `REVOKED`.
- Batch extension skips ineligible codes and reports mutually exclusive `activated`, `revoked`, and `expired` counts in that precedence order.
- Batch and eligible code updates execute in one transaction.
- UI labels and API errors must exist in Vietnamese and English.
- Existing uncommitted product activation-code table changes must be preserved.

---

### Task 1: Add shared contracts and extension permission

**Files:**

- Create: `packages/shared/src/types/activation-code-expiry-extension.types.ts`
- Modify: `packages/shared/src/types/index.ts`
- Modify: `packages/shared/src/constants/permissions.ts`
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260910120000_add_activation_code_expiry_extension_permission/migration.sql`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`
- Test: `apps/admin/src/views/staff/staff-permissions-locales.test.ts`
- Test: `apps/admin/src/views/settings/settings.utils.test.ts`

**Interfaces:**

- Produces `ExtendActivationCodeExpiryBody`, `ExtendActivationCodeExpiryResult`, `ExtendActivationCodeBatchExpiryResult`.
- Produces `PERMISSIONS.ACTIVATION_CODE_BATCH_EXTEND` and Prisma `permission_key.ACTIVATION_CODE_BATCH_EXTEND`.

- [ ] **Step 1: Write failing contract and locale assertions**

Add assertions that `ALL_PERMISSIONS`, the activation-code permission group, moderator dependency map, Staff labels and Settings labels include `ACTIVATION_CODE_BATCH_EXTEND`. Add a source assertion that the migration adds the enum value.

- [ ] **Step 2: Run RED**

Run:

```powershell
pnpm --dir apps/admin exec node --import tsx --test "src/views/staff/staff-permissions-locales.test.ts" "src/views/settings/settings.utils.test.ts"
```

Expected: fail because the permission and locale labels do not exist.

- [ ] **Step 3: Add contracts and permission**

Create:

```ts
export const MAX_ACTIVATION_CODE_EXTENSION_MONTHS = 120;

export type ExtendActivationCodeExpiryBody = { months: number };

export type ExtendActivationCodeExpiryResult = {
  activationCodeId: string;
  previousExpiresAt: string;
  expiresAt: string;
};

export type ExtendActivationCodeBatchExpiryResult = {
  batchId: string;
  previousExpiresAt: string;
  expiresAt: string;
  extendedCount: number;
  skipped: { activated: number; revoked: number; expired: number };
};
```

Export the file, add `ACTIVATION_CODE_BATCH_EXTEND` to the shared permission constant/group/dependency, add the Prisma enum member, and create:

```sql
ALTER TYPE "permission_key"
ADD VALUE IF NOT EXISTS 'ACTIVATION_CODE_BATCH_EXTEND';
```

Add Staff and Settings permission labels in both locales.

- [ ] **Step 4: Generate Prisma and run GREEN**

Run:

```powershell
pnpm --filter @repo/api prisma:generate
pnpm --dir apps/admin exec node --import tsx --test "src/views/staff/staff-permissions-locales.test.ts" "src/views/settings/settings.utils.test.ts"
```

Expected: pass.

### Task 2: Implement guarded single-code extension

**Files:**

- Create: `apps/api/src/modules/activation-codes/dto/extend-activation-code-expiry.dto.ts`
- Create: `apps/api/src/modules/activation-codes/use-cases/extend-activation-code-expiry.use-case.ts`
- Create: `apps/api/src/modules/activation-codes/tests/extend-activation-code-expiry.dto.spec.ts`
- Create: `apps/api/src/modules/activation-codes/tests/extend-activation-code-expiry.use-case.spec.ts`
- Modify: `apps/api/src/modules/activation-codes/repository/activation-code-batches.repository.ts`
- Modify: `apps/api/src/modules/activation-codes/activation-codes.controller.ts`
- Modify: `apps/api/src/modules/activation-codes/activation-codes.module.ts`

**Interfaces:**

- Consumes `{ months: number }` and `activationCodeId`.
- Produces `POST /activation-code-batches/codes/:id/extend-expiry` returning `ExtendActivationCodeExpiryResult`.
- Repository method: `extendCodeExpiry(input: { id: string; months: number; now: Date })`.

- [ ] **Step 1: Write failing DTO and use-case tests**

Cover integer bounds 1–120. Cover success, missing code, expired code, `ACTIVATED`, `REVOKED`, and repository conflict. The success expectation is:

```ts
expect(result).toEqual({
  activationCodeId: "code-id",
  previousExpiresAt: new Date("2027-01-31T10:30:00Z"),
  expiresAt: new Date("2027-02-28T10:30:00Z"),
});
```

- [ ] **Step 2: Run RED**

Run:

```powershell
pnpm --filter @repo/api test -- extend-activation-code-expiry
```

Expected: fail because DTO/use case/repository method do not exist.

- [ ] **Step 3: Implement DTO, use case and conditional repository transaction**

DTO:

```ts
export class ExtendActivationCodeExpiryDto {
  @IsInt()
  @Min(1)
  @Max(MAX_ACTIVATION_CODE_EXTENSION_MONTHS)
  months!: number;
}
```

Repository transaction loads `{ id, status, expires_at }`, rejects missing/ineligible data through a discriminated result, calculates with `addCalendarMonthsUtc`, then performs `updateMany` guarded by id, original status, original expiry and `expires_at > now`. A zero update count returns conflict.

Use case maps repository result kinds to `NotFoundError`, `BadRequestError` codes `ACTIVATION_CODE_EXTENSION_EXPIRED` and `ACTIVATION_CODE_EXTENSION_STATUS_NOT_ALLOWED`, or `ConflictError` code `ACTIVATION_CODE_EXTENSION_CONFLICT`.

Register the use case and protect the endpoint with `permission_key.ACTIVATION_CODE_BATCH_EXTEND`.

- [ ] **Step 4: Run GREEN**

Run:

```powershell
pnpm --filter @repo/api test -- extend-activation-code-expiry
```

Expected: all focused tests pass.

### Task 3: Implement partial batch extension and skip summary

**Files:**

- Create: `apps/api/src/modules/activation-codes/use-cases/extend-activation-code-batch-expiry.use-case.ts`
- Create: `apps/api/src/modules/activation-codes/tests/extend-activation-code-batch-expiry.use-case.spec.ts`
- Modify: `apps/api/src/modules/activation-codes/repository/activation-code-batches.repository.ts`
- Modify: `apps/api/src/modules/activation-codes/activation-codes.controller.ts`
- Modify: `apps/api/src/modules/activation-codes/activation-codes.module.ts`

**Interfaces:**

- Consumes `batchId` and `{ months: number }`.
- Produces `POST /activation-code-batches/:id/extend-expiry` returning `ExtendActivationCodeBatchExpiryResult`.
- Repository method: `extendBatchExpiry(input: { batchId: string; months: number; now: Date })`.

- [ ] **Step 1: Write failing use-case/repository tests**

Test missing batch, expired batch, no eligible codes, mixed code statuses and successful update. Mixed input must produce:

```ts
{
  extendedCount: 75,
  skipped: { activated: 10, revoked: 10, expired: 5 },
}
```

Also assert every code belongs to exactly one skip group using precedence `ACTIVATED`, `REVOKED`, then expired.

- [ ] **Step 2: Run RED**

Run:

```powershell
pnpm --filter @repo/api test -- extend-activation-code-batch-expiry
```

Expected: fail because batch extension is missing.

- [ ] **Step 3: Implement transaction**

Within one Prisma interactive transaction:

1. Load the batch expiry and all code ids/statuses/expiries.
2. Return `NOT_FOUND` or `EXPIRED_BATCH` before writes.
3. Partition codes into mutually exclusive skip groups and eligible codes.
4. If no eligible ids exist, return the zero result without updating the batch.
5. Calculate each eligible code's expiry with `addCalendarMonthsUtc` and update guarded by its original status/expiry.
6. Update batch expiry guarded by the original expiry and `expires_at > now`.
7. Throw a repository conflict if any guarded update misses.

Register and expose the permissioned endpoint.

- [ ] **Step 4: Run GREEN**

Run:

```powershell
pnpm --filter @repo/api test -- extend-activation-code-batch-expiry
```

Expected: all focused tests pass.

### Task 4: Add Admin service and reusable live-preview dialog

**Files:**

- Modify: `apps/admin/src/services/activation-codes/create-activation-codes.service.ts`
- Modify: `apps/admin/src/services/activation-codes/activation-codes.types.ts`
- Modify: `apps/admin/src/services/activation-codes/activation-codes.service.test.ts`
- Create: `apps/admin/src/views/activation-code-batches/activation-code-expiry-extension.utils.ts`
- Create: `apps/admin/src/views/activation-code-batches/activation-code-expiry-extension.utils.test.ts`
- Create: `apps/admin/src/views/activation-code-batches/components/activation-code-expiry-extension-dialog.tsx`
- Create: `apps/admin/src/views/activation-code-batches/activation-code-expiry-extension-dialog.test.ts`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`

**Interfaces:**

- Produces service methods `extendCodeExpiry(codeId, body)` and `extendBatchExpiry(batchId, body)`.
- Produces reusable `ActivationCodeExpiryExtensionDialog` accepting mode, id, label, current expiry, open state, and success callback.

- [ ] **Step 1: Write failing service, utility and component-source tests**

Assert exact POST URLs/bodies. Test client-side calendar preview for month end. Assert dialog contains one numeric input, current expiry, live projected expiry, validation, loading state and localized labels.

- [ ] **Step 2: Run RED**

Run:

```powershell
pnpm --dir apps/admin exec node --import tsx --test "src/services/activation-codes/activation-codes.service.test.ts" "src/views/activation-code-batches/activation-code-expiry-extension.utils.test.ts" "src/views/activation-code-batches/activation-code-expiry-extension-dialog.test.ts"
```

Expected: fail because methods, utility and dialog do not exist.

- [ ] **Step 3: Implement service and dialog**

Use one controlled dialog with `months` string state, parsed integer validation 1–120, and a pure `addCalendarMonths` preview helper. Render dates with `formatDate(..., { locale, showTime: true })`. On success, reset input and call the supplied callback.

For batch success, compose only non-zero skip groups into the localized toast. Add localized API messages for all backend error codes.

- [ ] **Step 4: Run GREEN**

Run the Step 2 command again. Expected: pass.

### Task 5: Wire quick actions into batch and shared code tables

**Files:**

- Modify: `apps/admin/src/views/activation-code-batches/activation-code-batches.view.tsx`
- Modify: `apps/admin/src/views/activation-code-batches/hooks/use-activation-code-batches.ts`
- Modify: `apps/admin/src/views/activation-code-batches/components/activation-code-batches-table.tsx`
- Modify: `apps/admin/src/views/activation-code-batches/activation-code-detail.view.tsx`
- Modify: `apps/admin/src/views/activation-code-batches/activation-code-batch-assignment-progress.test.ts`
- Modify: `apps/admin/src/views/activation-code-batches/product-activation-codes-page.test.ts`

**Interfaces:**

- Consumes `PERMISSIONS.ACTIVATION_CODE_BATCH_EXTEND` and `ActivationCodeExpiryExtensionDialog`.
- Produces the batch action on desktop/mobile and the code action in both shared table contexts.

- [ ] **Step 1: Write failing UI-source tests**

Assert:

- Batch actions render `CalendarPlus`, `extendBatchAction`, and the batch-mode dialog when permitted and unexpired.
- Code actions render `CalendarPlus`, `extendCodeAction`, and the code-mode dialog only when status is not `ACTIVATED`/`REVOKED` and expiry is in the future.
- The shared code view invalidates both batch/product detail query keys after success.

- [ ] **Step 2: Run RED**

Run:

```powershell
pnpm --dir apps/admin exec node --import tsx --test "src/views/activation-code-batches/activation-code-batch-assignment-progress.test.ts" "src/views/activation-code-batches/product-activation-codes-page.test.ts"
```

Expected: fail because quick actions are absent.

- [ ] **Step 3: Wire actions and query invalidation**

Calculate `canExtend` from permission plus current expiry/status. Pass batch extension capability through view/table/mobile card/menu props. In the shared code table, open the same dialog from the row action and invalidate the resource-specific `activation-code-detail` query after success.

- [ ] **Step 4: Run focused GREEN**

Run the Step 2 command again. Expected: pass.

- [ ] **Step 5: Verify integration boundaries**

Run:

```powershell
pnpm --filter @repo/shared build
pnpm --filter @repo/api lint
pnpm --filter @repo/api check-types
pnpm --filter @repo/api test
pnpm --filter @repo/api build
pnpm --filter @repo/admin lint
pnpm --filter @repo/admin check-types
pnpm --filter @repo/admin test
pnpm --filter @repo/admin build
git diff --check
```

Expected: all commands exit 0. Restore generated-only `apps/admin/next-env.d.ts` changes if Next rewrites that reference.
