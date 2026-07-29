# Contact Submission Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce the pending-phone invariant under concurrency, store canonical province data, avoid eager/duplicate province requests, and remove generated diff noise.

**Architecture:** PostgreSQL owns the concurrency invariant through a partial unique index, while the contact use case maps the resulting Prisma conflict into the existing public error code. The API resolves the canonical province name through the Locations module. Web province loading moves to one TanStack Query cache and is enabled lazily for quick chat without unmounting the form.

**Tech Stack:** PostgreSQL, Prisma, NestJS, Jest, Next.js 16, React 19, TanStack Query, React Hook Form, Zod.

## Global Constraints

- Preserve `CONTACT_SUBMISSION_PHONE_PENDING` and its current HTTP 409 behavior.
- Treat `NEW` and `IN_PROGRESS` as the only pending statuses.
- Keep the quick-chat form mounted while closed so unfinished input remains intact.
- Do not add another HTTP client or install a new package.
- Continue using the public Locations API as the source of province choices.
- Keep `app/**/page.tsx` and `app/**/layout.tsx` limited to composition.

---

### Task 1: Enforce One Pending Submission Per Phone

**Files:**

- Create: `apps/api/prisma/migrations/20260729140000_enforce_unique_pending_contact_phone/migration.sql`
- Modify: `apps/api/src/modules/contact-submissions/use-cases/create-contact-submission.use-case.ts`
- Modify: `apps/api/src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts`

**Interfaces:**

- Consumes: `CONTACT_SUBMISSION_PENDING_STATUSES`, normalized phone strings.
- Produces: a database-enforced invariant and the existing `ConflictError` response with code `CONTACT_SUBMISSION_PHONE_PENDING`.

- [ ] **Step 1: Add a failing race-conflict use-case test**

Create a Prisma unique error after the initial pending lookup returns `null`:

```ts
import { Prisma } from "@prisma/client";

it("maps a concurrent pending-phone insert conflict to the public conflict code", async () => {
  repository.findPendingByPhone.mockResolvedValue(null);
  repository.create.mockRejectedValue(
    new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      clientVersion: "test",
      code: "P2002",
      meta: {
        target: "contact_submissions_pending_phone_unique",
      },
    }),
  );
  const useCase = new CreateContactSubmissionUseCase(repository as never);

  await expect(
    useCase.execute({
      consultationTopic: "PRODUCT_CONSULTATION",
      content: "Toi can tu van phim cach nhiet cho xe.",
      fullName: "Nguyen Van A",
      phone: "0886 33 77 33",
      provinceCode: "79",
      provinceName: "Thành phố Hồ Chí Minh",
    }),
  ).rejects.toMatchObject<Partial<ConflictError>>({
    code: CONTACT_SUBMISSION_ERROR_CODES.PHONE_PENDING,
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
```

Expected: the new test fails because `P2002` is not mapped to `CONTACT_SUBMISSION_PHONE_PENDING`.

- [ ] **Step 3: Add the partial unique database index**

Create the migration with:

```sql
CREATE UNIQUE INDEX "contact_submissions_pending_phone_unique"
ON "contact_submissions" ("phone")
WHERE "status" IN ('NEW', 'IN_PROGRESS');
```

Do not model this as `@@unique` in Prisma because Prisma cannot express the partial-status predicate.

- [ ] **Step 4: Map the database race into the existing domain conflict**

Wrap `repository.create()` in `CreateContactSubmissionUseCase`:

```ts
try {
  const submission = await this.repository.create({
    consultation_topic: consultationTopic,
    content,
    full_name: fullName,
    phone,
    province_code: provinceCode,
    province_name: provinceName,
    source_path: sourcePath,
  });

  return toContactSubmissionResponse(submission);
} catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new ConflictError(
      "Phone already has a pending contact submission",
      CONTACT_SUBMISSION_ERROR_CODES.PHONE_PENDING,
      { phone },
    );
  }

  throw error;
}
```

Keep the existing pre-check so the normal duplicate path avoids using an exception; the unique index handles the race between check and insert.

- [ ] **Step 5: Add a migration source assertion**

Read the new migration in the repository test and assert it contains:

```ts
expect(migrationSource).toContain(
  'CREATE UNIQUE INDEX "contact_submissions_pending_phone_unique"',
);
expect(migrationSource).toContain(`WHERE "status" IN ('NEW', 'IN_PROGRESS')`);
```

- [ ] **Step 6: Run API tests and typecheck**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
pnpm.cmd --filter @repo/api check-types
```

Expected: all focused tests and typecheck pass.

- [ ] **Step 7: Commit the database invariant**

```powershell
git add apps/api/prisma/migrations/20260729140000_enforce_unique_pending_contact_phone/migration.sql apps/api/src/modules/contact-submissions/use-cases/create-contact-submission.use-case.ts apps/api/src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
git commit -m "fix(api): enforce pending contact phone uniqueness"
```

---

### Task 2: Resolve Canonical Province Data in the API

**Files:**

- Modify: `packages/shared/src/types/contact-submission.types.ts`
- Modify: `apps/api/src/modules/locations/locations.module.ts`
- Modify: `apps/api/src/modules/contact-submissions/contact-submissions.module.ts`
- Modify: `apps/api/src/modules/contact-submissions/dto/contact-submission.dto.ts`
- Modify: `apps/api/src/modules/contact-submissions/use-cases/create-contact-submission.use-case.ts`
- Modify: `apps/api/src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts`
- Modify: `apps/web/src/components/common/contact-message-form.tsx`
- Modify: `apps/web/tests/contact-form.test.mjs`

**Interfaces:**

- Consumes: `GetVietnamProvinceUseCase.execute(code: number, depth?: number)`.
- Produces: `CreateContactSubmissionBody` containing `provinceCode` only; `ContactSubmissionResponse` still contains canonical `provinceCode` and `provinceName`.

- [ ] **Step 1: Write failing API tests for canonical lookup**

Add a lookup mock:

```ts
const provinceLookup = {
  execute: jest.fn(),
};
```

Update use-case construction:

```ts
const useCase = new CreateContactSubmissionUseCase(
  repository as never,
  provinceLookup as never,
);
```

For the success test:

```ts
provinceLookup.execute.mockResolvedValue({
  code: 79,
  codename: "thanh_pho_ho_chi_minh",
  division_type: "thành phố trung ương",
  name: "Thành phố Hồ Chí Minh",
  phone_code: 28,
});
```

Assert:

```ts
expect(provinceLookup.execute).toHaveBeenCalledWith(79, 1);
expect(repository.create).toHaveBeenCalledWith(
  expect.objectContaining({
    province_code: "79",
    province_name: "Thành phố Hồ Chí Minh",
  }),
);
```

Remove `provinceName` from the create request fixture so the test fails against the current contract.

- [ ] **Step 2: Run the focused API test and confirm it fails**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
```

Expected: compile/test failure because the use case still reads `input.provinceName` and has no province lookup dependency.

- [ ] **Step 3: Remove client-owned province name from the create contract**

Change the shared body to:

```ts
export type CreateContactSubmissionBody = {
  consultationTopic: ContactConsultationTopic;
  content: string;
  fullName: string;
  phone: string;
  provinceCode: string;
  sourcePath?: string | null;
};
```

Remove `provinceName` from `CreateContactSubmissionDto`. Add numeric validation to `provinceCode`:

```ts
@Matches(/^\d+$/)
provinceCode: string;
```

- [ ] **Step 4: Export and inject the canonical province query**

In `LocationsModule`:

```ts
@Module({
  imports: [HttpModule, RedisModule],
  controllers: [LocationsController],
  providers: [
    VietnamProvincesClient,
    LocationsCacheService,
    ListVietnamDivisionsUseCase,
    ListVietnamProvincesUseCase,
    GetVietnamProvinceUseCase,
    ListVietnamWardsUseCase,
    GetVietnamWardUseCase,
    LookupVietnamLegacyWardUseCase,
    ListVietnamLegacyWardsUseCase,
  ],
  exports: [GetVietnamProvinceUseCase],
})
export class LocationsModule {}
```

Import `LocationsModule` in `ContactSubmissionsModule`.

- [ ] **Step 5: Resolve and persist the canonical name**

Inject the lookup:

```ts
constructor(
  private readonly repository: ContactSubmissionsRepository,
  private readonly getVietnamProvinceUseCase: GetVietnamProvinceUseCase,
) {}
```

Validate direct use-case calls and resolve the province:

```ts
if (!/^\d+$/.test(provinceCode)) {
  throw new BadRequestError("Contact submission province is invalid");
}

const province = await this.getVietnamProvinceUseCase.execute(
  Number(provinceCode),
  1,
);
```

Persist:

```ts
province_code: String(province.code),
province_name: province.name.trim(),
```

- [ ] **Step 6: Stop Web from sending `provinceName`**

Keep the selected-province check for client feedback, but submit:

```ts
await contactSubmissionsService.createContactSubmission({
  ...values,
  ...(variant === "page"
    ? {
        sourcePath:
          typeof window === "undefined" ? "/contact" : window.location.pathname,
      }
    : {}),
});
```

Update the Web source test to assert the request no longer contains `provinceName: selectedProvince.name`.

- [ ] **Step 7: Run cross-layer tests**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
pnpm.cmd --filter @repo/api check-types
node --test apps/web/tests/contact-form.test.mjs
```

Expected: API tests/typecheck and all Web contact tests pass.

- [ ] **Step 8: Commit canonical province handling**

```powershell
git add packages/shared/src/types/contact-submission.types.ts apps/api/src/modules/locations/locations.module.ts apps/api/src/modules/contact-submissions apps/web/src/components/common/contact-message-form.tsx apps/web/tests/contact-form.test.mjs
git commit -m "fix(contact): resolve canonical province on submit"
```

---

### Task 3: Lazy-Load and Cache Province Options

**Files:**

- Modify: `apps/web/src/hooks/use-vietnam-provinces.ts`
- Modify: `apps/web/src/components/common/contact-message-form.tsx`
- Modify: `apps/web/src/components/common/public-quick-chat.tsx`
- Modify: `apps/web/tests/contact-form.test.mjs`

**Interfaces:**

- Produces: `useVietnamProvinces({ enabled?: boolean })` backed by one TanStack Query cache key.
- Consumes: `ContactMessageForm` prop `loadLocations?: boolean`, defaulting to `true`.

- [ ] **Step 1: Add failing source regression assertions**

Extend the Web test:

```js
assert.match(provincesHookSource, /useQuery/);
assert.match(provincesHookSource, /enabled/);
assert.match(
  quickChatSource,
  /<ContactMessageForm[\s\S]*loadLocations=\{isOpen\}[\s\S]*variant="quickChat"/,
);
```

Also assert that the old request-version state has been removed:

```js
assert.doesNotMatch(provincesHookSource, /requestVersion/);
```

- [ ] **Step 2: Run the Web test and confirm it fails**

Run:

```powershell
node --test apps/web/tests/contact-form.test.mjs
```

Expected: the new lazy-loading assertions fail.

- [ ] **Step 3: Replace local request state with TanStack Query**

Implement:

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { locationsService } from "@/src/services/locations/locations.service";

const VIETNAM_PROVINCES_QUERY_KEY = [
  "locations",
  "vietnam",
  "provinces",
] as const;

export function useVietnamProvinces({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const query = useQuery({
    enabled,
    queryFn: () => locationsService.listVietnamProvinces(),
    queryKey: VIETNAM_PROVINCES_QUERY_KEY,
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ?? [],
  };
}
```

This shares one cache between the Contact page and quick chat.

- [ ] **Step 4: Gate loading without unmounting the form**

Extend form props:

```ts
type ContactMessageFormProps = {
  loadLocations?: boolean;
  variant?: "page" | "quickChat";
};
```

Default `loadLocations = true` and call:

```ts
const provincesQuery = useVietnamProvinces({
  enabled: loadLocations,
});
```

Change the retry handler to avoid passing the click event:

```tsx
onClick={() => {
  void provincesQuery.refetch();
}}
```

In quick chat:

```tsx
<ContactMessageForm loadLocations={isOpen} variant="quickChat" />
```

The form stays mounted, so entered values remain after closing.

- [ ] **Step 5: Run Web tests and focused lint**

Run:

```powershell
node --test apps/web/tests/contact-form.test.mjs
pnpm.cmd --filter @repo/web exec eslint src/hooks/use-vietnam-provinces.ts src/components/common/contact-message-form.tsx src/components/common/public-quick-chat.tsx tests/contact-form.test.mjs --max-warnings 0
```

Expected: all Web contact tests and lint pass.

- [ ] **Step 6: Commit lazy location loading**

```powershell
git add apps/web/src/hooks/use-vietnam-provinces.ts apps/web/src/components/common/contact-message-form.tsx apps/web/src/components/common/public-quick-chat.tsx apps/web/tests/contact-form.test.mjs
git commit -m "perf(web): lazy load quick chat locations"
```

---

### Task 4: Remove Generated Diff Noise and Run Final Verification

**Files:**

- Restore: `apps/web/next-env.d.ts`

**Interfaces:**

- Produces: a clean feature diff without environment-generated route type paths.

- [ ] **Step 1: Restore the tracked `next-env.d.ts` content**

Restore line 3 to:

```ts
import "./.next/types/routes.d.ts";
```

Do not include `.next/dev/types/routes.d.ts` in the feature commit.

- [ ] **Step 2: Validate Prisma migration and API**

Run:

```powershell
pnpm.cmd --filter @repo/api exec prisma validate
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
pnpm.cmd --filter @repo/api check-types
```

Expected: Prisma schema validates, API tests pass, and API typecheck passes.

- [ ] **Step 3: Validate Admin and Web**

Run:

```powershell
pnpm.cmd --filter @repo/admin lint
node --test apps/web/tests/contact-form.test.mjs
pnpm.cmd --filter @repo/web exec eslint "app/[locale]/layout.tsx" src/components/common/contact-message-form.tsx src/components/common/public-contact-actions.tsx src/components/common/public-quick-chat.tsx src/hooks/use-vietnam-provinces.ts tests/contact-form.test.mjs --max-warnings 0
```

Expected: lint and focused Web tests pass.

Run the Admin suite:

```powershell
pnpm.cmd --filter @repo/admin test
```

Expected after repository dependencies are complete: all tests pass. If it still stops on missing `@radix-ui/react-avatar`, report that existing dependency blocker separately and do not install packages as part of this plan.

- [ ] **Step 4: Inspect the final diff**

Run:

```powershell
git diff --check
git status --short
git diff --stat
```

Expected:

- No whitespace errors.
- `apps/web/next-env.d.ts` is absent from the diff.
- The new partial unique migration is present.
- No unrelated files were reverted.

- [ ] **Step 5: Commit cleanup only if it remains separate**

```powershell
git add apps/web/next-env.d.ts
git commit -m "chore(web): restore generated Next type reference"
```

Skip this commit if restoring the file removes it from the diff entirely.
