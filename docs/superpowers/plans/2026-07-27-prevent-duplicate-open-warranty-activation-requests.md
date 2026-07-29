# Prevent Duplicate Open Warranty Activation Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow each physical Product to have at most one Warranty Activation Request in `PENDING` or `APPROVED` status across Public Web and Admin Portal.

**Architecture:** Add an application-level Product-scoped open-request guard in the shared create use case and a PostgreSQL partial unique index as the concurrency backstop. Preserve closed request history, map concurrent unique conflicts to the same domain error, and run the guard before Dealer creation or notification.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Jest, TypeScript, pnpm.

## Global Constraints

- Treat only `PENDING` and `APPROVED` as open request statuses.
- Permit resubmission after `REJECTED` or `CANCELLED`.
- Keep existing Warranty eligibility behavior for `ACTIVATED` requests.
- Apply the same rule to Public Web and Admin Portal through the shared create use case.
- Do not delete, cancel, or rewrite historical requests automatically.
- Do not change Admin/Web UI in this task.
- Do not add dependencies.
- Do not stage or commit unless the user explicitly requests it.
- Ask for approval before running tests, migrations, database commands, or other executable verification commands.

---

## File Map

- Create `apps/api/src/modules/warranty-activation-requests/warranty-activation-requests.constants.ts`
  - Own the reusable definition of open activation-request statuses.
- Modify `apps/api/src/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.ts`
  - Replace phone-scoped pending lookup with Product-scoped open-request lookup.
- Modify `apps/api/src/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case.ts`
  - Reject an existing open request before side effects.
  - Map a concurrent database uniqueness conflict to the same domain error.
- Modify `apps/api/src/modules/warranty-activation-requests/tests/warranty-activation-requests.use-cases.spec.ts`
  - Cover Product-scoped duplicate behavior, error details, side-effect ordering, and race handling.
- Create `apps/api/src/modules/warranty-activation-requests/tests/warranty-activation-requests.repository.spec.ts`
  - Lock down the exact open-status query.
- Create `apps/api/prisma/migrations/20260727090000_prevent_duplicate_open_warranty_activation_requests/migration.sql`
  - Audit existing open duplicates and add the partial unique index.
- Modify `apps/api/prisma/seed.ts`
  - Keep synthetic `WAR-CHART-*` aggregates detached from physical Products.

### Task 1: Define and query Product-scoped open requests

**Files:**

- Create: `apps/api/src/modules/warranty-activation-requests/warranty-activation-requests.constants.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.ts`
- Create: `apps/api/src/modules/warranty-activation-requests/tests/warranty-activation-requests.repository.spec.ts`

**Interfaces:**

- Produces:

```ts
export const OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES: warranty_activation_request_status[];

findOpenByProductId(productId: string): Promise<{
  id: string;
  request_code: string;
  status: warranty_activation_request_status;
} | null>;
```

- [ ] **Step 1: Write the failing repository test**

Create a PrismaService mock and assert that `findOpenByProductId` queries only
the Product and open statuses:

```ts
import { WarrantyActivationRequestsRepository } from "@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository";
import { warranty_activation_request_status } from "@prisma/client";

describe("WarrantyActivationRequestsRepository", () => {
  it("finds the newest pending or approved request for a product", async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prismaService = {
      warrantyActivationRequest: { findFirst },
    };
    const repository = new WarrantyActivationRequestsRepository(
      prismaService as never,
      {} as never,
      {} as never,
    );

    await repository.findOpenByProductId("product-id");

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        product_id: "product-id",
        status: {
          in: [
            warranty_activation_request_status.PENDING,
            warranty_activation_request_status.APPROVED,
          ],
        },
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        request_code: true,
        status: true,
      },
    });
  });
});
```

- [ ] **Step 2: Run the repository test and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/warranty-activation-requests/tests/warranty-activation-requests.repository.spec.ts
```

Expected: FAIL because `findOpenByProductId` does not exist.

- [ ] **Step 3: Add the open-status constant**

Create:

```ts
import { warranty_activation_request_status } from "@prisma/client";

export const OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES: warranty_activation_request_status[] =
  [
    warranty_activation_request_status.PENDING,
    warranty_activation_request_status.APPROVED,
  ];
```

- [ ] **Step 4: Replace the repository duplicate lookup**

Remove:

```ts
findPendingDuplicate(input: { warrantyCode: string; customerPhone: string })
```

Add:

```ts
findOpenByProductId(productId: string) {
  return this.prismaService.warrantyActivationRequest.findFirst({
    where: {
      product_id: productId,
      status: {
        in: OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES,
      },
    },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      request_code: true,
      status: true,
    },
  });
}
```

Import `OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES` from the feature constants
file.

- [ ] **Step 5: Run the repository test and verify GREEN**

Run the command from Step 2.

Expected: 1 test passes.

### Task 2: Reject an existing open request before side effects

**Files:**

- Modify: `apps/api/src/modules/warranty-activation-requests/tests/warranty-activation-requests.use-cases.spec.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case.ts`

**Interfaces:**

- Consumes:

```ts
warrantyActivationRequestsRepository.findOpenByProductId(productId);
```

- Produces this domain error:

```ts
new BadRequestError(
  "Product already has an open warranty activation request",
  "BAD_REQUEST",
  {
    code: "ACTIVATION_REQUEST_ALREADY_OPEN",
    currentStatus: openRequest.status,
    productId,
    requestCode: openRequest.request_code,
  },
);
```

- [ ] **Step 1: Rename the repository mock method**

Replace all `findPendingDuplicate` mock setup and assertions with
`findOpenByProductId`. Successful create tests must resolve it to `null`.

- [ ] **Step 2: Write a failing Product-scoped duplicate test**

Use a request whose submitted phone differs from the existing request:

```ts
it("rejects a second pending request for the same product even when the phone changes", async () => {
  repository.findOpenByProductId.mockResolvedValue({
    id: "existing-request-id",
    request_code: "WAR-20260727-0001",
    status: warranty_activation_request_status.PENDING,
  });
  productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
    baseDraftProduct,
  );
  const useCase = createUseCase();

  await expect(
    useCase.execute({
      ...baseCreateDto,
      customerPhone: "0988888888",
    }),
  ).rejects.toMatchObject({
    details: {
      code: "ACTIVATION_REQUEST_ALREADY_OPEN",
      currentStatus: warranty_activation_request_status.PENDING,
      productId: "product-id",
      requestCode: "WAR-20260727-0001",
    },
  });

  expect(repository.findOpenByProductId).toHaveBeenCalledWith("product-id");
  expect(dealersRepository.create).not.toHaveBeenCalled();
  expect(repository.create).not.toHaveBeenCalled();
  expect(
    warrantyActivationRequestNotificationService.requestCreated,
  ).not.toHaveBeenCalled();
});
```

If the test file does not already expose `baseCreateDto` or `createUseCase`,
add local test helpers containing the same dependencies and valid DTO values
already used by the suite; do not move production logic into test helpers.

- [ ] **Step 3: Write a failing `APPROVED` test**

Mock `findOpenByProductId` with status `APPROVED` and assert the same
`ACTIVATION_REQUEST_ALREADY_OPEN` error with `currentStatus: 'APPROVED'`.

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/warranty-activation-requests/tests/warranty-activation-requests.use-cases.spec.ts
```

Expected: FAIL because the use case still queries by Warranty code and phone.

- [ ] **Step 5: Add a reusable domain-error helper**

Import `warranty_activation_request_status` and add:

```ts
private throwAlreadyOpenRequest(
  productId: string,
  openRequest: {
    request_code: string;
    status: warranty_activation_request_status;
  },
): never {
  throw new BadRequestError(
    'Product already has an open warranty activation request',
    'BAD_REQUEST',
    {
      code: 'ACTIVATION_REQUEST_ALREADY_OPEN',
      currentStatus: openRequest.status,
      productId,
      requestCode: openRequest.request_code,
    },
  );
}
```

- [ ] **Step 6: Move the guard before Dealer resolution**

After Product/Warranty eligibility, category validation, and current-owner
validation, add:

```ts
const openRequest =
  await this.warrantyActivationRequestsRepository.findOpenByProductId(
    product.id,
  );

if (openRequest) {
  this.throwAlreadyOpenRequest(product.id, openRequest);
}

const dealer = await this.resolveDealer(dto);
```

Remove the old `findPendingDuplicate({ warrantyCode, customerPhone })` block.
Ensure `resolveDealer(dto)` appears only after the new guard.

- [ ] **Step 7: Run the focused tests and verify GREEN**

Run the command from Step 4.

Expected: all activation-request use-case tests pass.

### Task 3: Map concurrent uniqueness conflicts to the domain error

**Files:**

- Modify: `apps/api/src/modules/warranty-activation-requests/tests/warranty-activation-requests.use-cases.spec.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case.ts`

**Interfaces:**

- Consumes Prisma `P2002`.
- Preserves the existing retry behavior only for `request_code` collisions.
- Produces `ACTIVATION_REQUEST_ALREADY_OPEN` when a post-conflict re-query finds
  an open request for the Product.

- [ ] **Step 1: Write the failing concurrent-conflict test**

Arrange:

```ts
repository.findOpenByProductId
  .mockResolvedValueOnce(null)
  .mockResolvedValueOnce({
    id: "winning-request-id",
    request_code: "WAR-20260727-0002",
    status: warranty_activation_request_status.PENDING,
  });
repository.create.mockRejectedValueOnce(
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    clientVersion: "test",
    code: "P2002",
    meta: {
      target: ["warranty_activation_request_one_open_per_product"],
    },
  }),
);
```

Assert the same Product-scoped domain error and assert notification was not
called.

- [ ] **Step 2: Write the failing unknown-conflict test**

Arrange a `P2002` error, have the second `findOpenByProductId` resolve `null`,
and assert the original Prisma error is rethrown. This prevents unrelated unique
violations from being mislabeled.

- [ ] **Step 3: Run the focused tests and verify RED**

Run the Task 2 focused Jest command.

Expected: concurrent conflict is still returned as raw Prisma `P2002`.

- [ ] **Step 4: Generalize unique-conflict detection**

Add:

```ts
private isUniqueConstraintConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
```

Keep `isRequestCodeConflict` for retrying generated request-code collisions.

- [ ] **Step 5: Re-query after non-request-code `P2002`**

Inside the existing create catch block, after the request-code retry branch:

```ts
if (this.isUniqueConstraintConflict(error)) {
  const openRequest =
    await this.warrantyActivationRequestsRepository.findOpenByProductId(
      product.id,
    );

  if (openRequest) {
    this.throwAlreadyOpenRequest(product.id, openRequest);
  }
}

throw error;
```

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run the Task 2 focused Jest command.

Expected: all tests pass, including existing request-code retry behavior.

### Task 4: Add the database invariant

**Files:**

- Modify: `apps/api/prisma/seed.ts`
- Create: `apps/api/prisma/migrations/20260727090000_prevent_duplicate_open_warranty_activation_requests/migration.sql`

**Interfaces:**

- Produces the PostgreSQL index:

```text
warranty_activation_request_one_open_per_product
```

- [ ] **Step 1: Audit the target database before migration**

Run only after explicit approval:

```sql
SELECT
  "product_id",
  COUNT(*) AS "open_request_count",
  ARRAY_AGG("request_code" ORDER BY "created_at") AS "request_codes"
FROM "warranty_activation_request"
WHERE
  "product_id" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED')
GROUP BY "product_id"
HAVING COUNT(*) > 1;
```

Expected: zero rows. If rows are returned, stop and ask the user which requests
should remain open; do not mutate them automatically.

- [ ] **Step 2: Detach synthetic chart requests from physical Products**

In the `WAR-CHART-*` seed loop, change only the Product relation:

```ts
productId: null,
```

Keep `productName`, `serialNumber`, `brand`, `model`, status, source, and dates
as snapshot/chart data.

- [ ] **Step 3: Create the migration**

Use:

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "warranty_activation_request"
    WHERE
      "product_id" IS NOT NULL
      AND "status" IN ('PENDING', 'APPROVED')
    GROUP BY "product_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one open warranty activation request per product: duplicate open requests exist';
  END IF;
END
$$;

CREATE UNIQUE INDEX
  "warranty_activation_request_one_open_per_product"
ON "warranty_activation_request" ("product_id")
WHERE
  "product_id" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED');
```

Do not remove the existing lookup index in this task.

- [ ] **Step 4: Reset the development database**

Run only after explicit approval:

```powershell
pnpm.cmd --filter @repo/api prisma:migrate:reset:dev
```

Expected: migrations apply, the updated seed completes, and no duplicate-open-
request error occurs.

- [ ] **Step 5: Verify the index and seeded invariant**

Use a read-only PostgreSQL catalog query:

```sql
SELECT indexdef
FROM pg_indexes
WHERE
  schemaname = current_schema()
  AND indexname =
    'warranty_activation_request_one_open_per_product';
```

Expected: one partial unique index containing `product_id`, `PENDING`, and
`APPROVED`. A second audit query must return zero duplicate Product IDs, and all
`WAR-CHART-*` rows must have `product_id = null`.

### Task 5: Regression verification

**Files:**

- Test existing API behavior only.

**Interfaces:**

- Consumes completed Tasks 1–4.
- Produces verification evidence without staging or committing.

- [ ] **Step 1: Run activation-request tests**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/warranty-activation-requests/tests/warranty-activation-requests.repository.spec.ts src/modules/warranty-activation-requests/tests/warranty-activation-requests.use-cases.spec.ts src/modules/warranty-activation-requests/tests/create-admin-warranty-activation-request.use-case.spec.ts
```

Expected: all suites pass.

- [ ] **Step 2: Run Warranty activation regressions**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/warranties/tests/activate-warranty-by-code.use-case.spec.ts src/modules/warranties/tests/manual-warranty-activation.use-case.spec.ts
```

Expected: both suites pass.

- [ ] **Step 3: Run static verification**

```powershell
pnpm.cmd --filter @repo/api check-types
pnpm.cmd --filter @repo/api exec eslint src/modules/warranty-activation-requests/warranty-activation-requests.constants.ts src/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.ts src/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case.ts src/modules/warranty-activation-requests/tests/warranty-activation-requests.repository.spec.ts src/modules/warranty-activation-requests/tests/warranty-activation-requests.use-cases.spec.ts
pnpm.cmd --filter @repo/api build
```

Expected: typecheck and build exit `0`; ESLint reports no errors in changed
files.

- [ ] **Step 4: Review the working tree**

```powershell
git diff --check
git status --short
git diff -- apps/api/src/modules/warranty-activation-requests apps/api/prisma/migrations/20260727090000_prevent_duplicate_open_warranty_activation_requests docs/superpowers/specs/2026-07-27-prevent-duplicate-open-warranty-activation-requests-design.md docs/superpowers/plans/2026-07-27-prevent-duplicate-open-warranty-activation-requests.md
```

Expected: only planned files and pre-existing user changes appear. Do not stage
or commit.
