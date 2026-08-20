# Customer Birthdate in Warranty Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist an optional birthdate on Customer profiles, prefill it in Admin warranty activation, and atomically snapshot/update it when an Admin request is created.

**Architecture:** Add a nullable Prisma column and expose it through shared Customer contracts. The Admin request carries an authoritative `customerId`; the Admin use case resolves the Customer, while the request repository performs the Customer update, request-to-customer connection, and request creation in one transaction. Public activation remains unchanged.

**Tech Stack:** Prisma 7, NestJS 11, class-validator, Jest, Next.js/React, React Hook Form, Zod, next-intl.

## Global Constraints

- Work inline and sequentially on the current branch.
- Do not use subagents or parallel task execution.
- Do not commit unless the user explicitly requests it.
- Existing Customer rows migrate with `birthdate = null`.
- Historical request snapshots never change when Customer is edited.
- Empty activation birthdate preserves the Customer value; Customer edit may explicitly clear it.
- Public warranty activation behavior and certificate/PDF behavior remain unchanged.

---

### Task 1: Customer persistence and shared contracts

**Files:**

- Create: `apps/api/prisma/migrations/20260820090000_add_customer_birthdate/migration.sql`
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `packages/shared/src/types/customer.types.ts`
- Modify: `apps/api/src/modules/customers/customers.types.ts`
- Test: `apps/api/src/modules/customers/tests/create-customer.use-case.spec.ts`
- Test: `apps/api/src/modules/customers/tests/update-customer.use-case.spec.ts`

**Interfaces:**

- Produces: `Customer.birthdate: Date | null` in Prisma.
- Produces: `CustomerSummary.birthdate: string | null`.
- Produces: `CreateCustomerBody.birthdate?: string` and `UpdateCustomerBody.birthdate?: string | null`.

- [ ] **Step 1: Add failing mapper/contract expectations**

Add assertions that Customer responses contain `birthdate`, create persists a supplied date, and update accepts both a date and `null`.

```ts
expect(result.birthdate).toEqual(new Date("2005-12-11T00:00:00.000Z"));
expect(customersRepository.create).toHaveBeenCalledWith(
  expect.objectContaining({ birthdate: new Date("2005-12-11") }),
);
expect(customersRepository.update).toHaveBeenCalledWith(
  "customer-id",
  expect.objectContaining({ birthdate: null }),
);
```

- [ ] **Step 2: Run Customer tests and verify RED**

Run:

```bash
pnpm --filter @repo/api run test -- create-customer.use-case.spec.ts update-customer.use-case.spec.ts --runInBand
```

Expected: FAIL because Customer contracts and use cases do not expose/persist `birthdate`.

- [ ] **Step 3: Add schema and migration**

Prisma field:

```prisma
birthdate DateTime?
```

Migration:

```sql
ALTER TABLE "customer" ADD COLUMN "birthdate" TIMESTAMP(3);
```

- [ ] **Step 4: Extend shared and API Customer response types**

Use ISO strings across the shared HTTP boundary:

```ts
birthdate: string | null;
```

Map Prisma values with:

```ts
birthdate: customer.birthdate?.toISOString() ?? null,
```

- [ ] **Step 5: Run Prisma generation and Customer tests**

Run:

```bash
pnpm --filter @repo/api prisma:generate
pnpm --filter @repo/api run test -- create-customer.use-case.spec.ts update-customer.use-case.spec.ts --runInBand
```

Expected: PASS.

---

### Task 2: Customer API create/update validation

**Files:**

- Modify: `apps/api/src/modules/customers/dto/create-customer.dto.ts`
- Modify: `apps/api/src/modules/customers/dto/update-customer.dto.ts`
- Create: `apps/api/src/common/decorators/is-not-future-date.decorator.ts`
- Modify: `apps/api/src/modules/customers/use-cases/create-customer.use-case.ts`
- Modify: `apps/api/src/modules/customers/use-cases/update-customer.use-case.ts`
- Test: `apps/api/src/modules/customers/tests/customers-birthdate.dto.spec.ts`

**Interfaces:**

- Consumes: ISO date-only input (`YYYY-MM-DD`) or `null` for Customer update.
- Produces: validated `birthdate?: string` and `birthdate?: string | null` DTO fields.

- [ ] **Step 1: Write DTO tests for valid, future, and clear cases**

Freeze the test date and assert:

```ts
expect(await validate(createDto({ birthdate: "2005-12-11" }))).toHaveLength(0);
expect(await validate(createDto({ birthdate: "2999-01-01" }))).not.toHaveLength(
  0,
);
expect(await validate(updateDto({ birthdate: null }))).toHaveLength(0);
```

- [ ] **Step 2: Run the DTO test and verify RED**

Run:

```bash
pnpm --filter @repo/api run test -- customers-birthdate.dto.spec.ts --runInBand
```

Expected: FAIL because the DTO fields and future-date validator are absent.

- [ ] **Step 3: Add optional date validation**

Implement `IsNotFutureDate` with `registerDecorator`; return `true` for
`undefined`/`null`, parse date-only input, and compare its UTC day with the
current UTC day. Apply it after `@IsDateString()` on create and under
`@ValidateIf((_, value) => value !== undefined && value !== null)` on update.

```ts
export function IsNotFutureDate(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: "isNotFutureDate",
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          if (typeof value !== "string") return false;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;
          const today = new Date();
          today.setUTCHours(23, 59, 59, 999);
          return date <= today;
        },
      },
    });
}
```

- [ ] **Step 4: Persist normalized dates in Customer use cases**

```ts
birthdate:
  dto.birthdate === null
    ? null
    : dto.birthdate
      ? new Date(dto.birthdate)
      : undefined,
```

- [ ] **Step 5: Re-run DTO and Customer use-case tests**

Expected: PASS.

---

### Task 3: Admin Customer create/edit form

**Files:**

- Modify: `apps/admin/src/views/customers/customers.types.ts`
- Modify: `apps/admin/src/views/customers/hooks/use-customer-form.ts`
- Modify: `apps/admin/src/views/customers/components/customer-form.tsx`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`
- Test: `apps/admin/src/views/customers/customers.utils.test.ts`
- Test: `apps/admin/src/views/customers/customer-birthdate-form.test.ts`

**Interfaces:**

- Consumes: `CustomerSummary.birthdate` ISO string or `null`.
- Produces: `birthdate` in Customer create/update bodies; update emits `null` when the user explicitly clears an existing date.

- [ ] **Step 1: Add failing form mapping/source tests**

Cover initial value, create body, update body, date picker bounds, and translation keys.

- [ ] **Step 2: Run focused Admin tests and verify RED**

Run:

```bash
pnpm --filter @repo/admin test
```

Expected: FAIL because Customer form does not contain birthdate.

- [ ] **Step 3: Add optional birthdate to Zod form values and body mapping**

```ts
birthdate: z.string().trim(),
```

Initialize from `customer?.birthdate?.slice(0, 10) ?? ''`; create omits empty values, while update sends `null` when an existing date is cleared.

- [ ] **Step 4: Add the shared DatePicker to CustomerForm**

Configure manual `dd/mm/yyyy` input, `minDate = 1900-01-01`, `maxDate = today`, dropdown month/year navigation, and localized errors.

- [ ] **Step 5: Re-run focused Admin tests**

Expected: PASS.

---

### Task 4: Admin activation request contract and prefill

**Files:**

- Modify: `packages/shared/src/types/warranty-activation-request.types.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/dto/create-admin-warranty-activation-request.dto.ts`
- Modify: `apps/admin/src/views/warranty-activation-requests/warranty-activation-requests.types.ts`
- Modify: `apps/admin/src/views/warranty-activation-requests/warranty-activation-requests.utils.ts`
- Modify: `apps/admin/src/views/warranty-activation-requests/hooks/use-create-warranty-activation-request-form.ts`
- Test: `apps/admin/src/views/warranty-activation-requests/warranty-activation-requests.utils.test.ts`
- Test: `apps/api/src/modules/warranty-activation-requests/tests/create-admin-warranty-activation-request.dto.spec.ts`

**Interfaces:**

- Produces: required `customerId: string` on `CreateAdminWarrantyActivationRequestBody` and DTO.
- Public `CreateWarrantyActivationRequestBody` remains unchanged.

- [ ] **Step 1: Add failing contract and form mapping tests**

Assert selecting a Customer sets both fields:

```ts
expect(form.getValues("customerId")).toBe(customer.id);
expect(form.getValues("customerBirthdate")).toBe("2005-12-11");
```

Assert the Admin body contains `customerId`.

- [ ] **Step 2: Run focused tests and verify RED**

Run the full Admin test command and the focused API DTO test:

```bash
pnpm --filter @repo/admin test
pnpm --filter @repo/api run test -- create-admin-warranty-activation-request.dto.spec.ts --runInBand
```

Expected: FAIL because `customerId` and birthdate prefill are absent.

- [ ] **Step 3: Add Admin-only contract/DTO field**

Declare `customerId` only on the Admin body/DTO and validate it with `@IsUUID()`.

- [ ] **Step 4: Store selected Customer ID and prefill birthdate**

Add hidden form state for `customerId`; `selectCustomer` sets the ID and `customer.birthdate?.slice(0, 10) ?? ''`; `clearCustomer` clears both.

- [ ] **Step 5: Re-run focused Admin/API tests**

Expected: PASS.

---

### Task 5: Atomic Customer update and request snapshot

**Files:**

- Modify: `apps/api/src/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case.ts`
- Modify: `apps/api/src/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.ts`
- Test: `apps/api/src/modules/warranty-activation-requests/tests/create-admin-warranty-activation-request.use-case.spec.ts`
- Test: `apps/api/src/modules/warranty-activation-requests/tests/warranty-activation-requests.repository.spec.ts`

**Interfaces:**

- Consumes: `customerId` and optional submitted birthdate.
- Produces repository operation that atomically updates Customer birthdate, connects `customer_id`, and creates the request snapshot.

- [ ] **Step 1: Add failing Admin use-case tests**

Cover:

```text
unknown customerId -> CUSTOMER_NOT_FOUND
submitted date -> profile update + identical request snapshot
omitted date -> existing profile date used for request snapshot
canonical selected Customer identity used for request
```

- [ ] **Step 2: Add failing repository transaction test**

Assert the transaction calls Customer update before request create and that a create failure rejects the transaction without an independent Customer write.

- [ ] **Step 3: Run focused API tests and verify RED**

Run:

```bash
pnpm --filter @repo/api run test -- create-admin-warranty-activation-request.use-case.spec.ts warranty-activation-requests.repository.spec.ts --runInBand
```

- [ ] **Step 4: Resolve the authoritative Customer in the Admin use case**

Inject `CustomersRepository`, reject an unknown ID with details code `CUSTOMER_NOT_FOUND`, and pass canonical name/phone/email plus effective birthdate into the shared create flow.

- [ ] **Step 5: Add the repository transaction boundary**

Extend the repository create input with an optional Admin customer profile operation:

```ts
type CreateActivationRequestOptions = {
  customerProfile?: {
    id: string;
    birthdate?: Date;
  };
};
```

Inside `$transaction`, update birthdate only when defined, connect the request to the Customer, and create the request using the transaction client.

- [ ] **Step 6: Preserve public behavior**

When no `customerProfile` option is supplied, create the request exactly as before and leave Customer resolution to approval.

- [ ] **Step 7: Re-run focused API tests**

Expected: PASS.

---

### Task 6: Regression verification

**Files:**

- Verify all files changed in Tasks 1-5.

- [ ] **Step 1: Generate Prisma client**

```bash
pnpm --filter @repo/api prisma:generate
```

- [ ] **Step 2: Run focused Customer and activation tests**

```bash
pnpm --filter @repo/api run test -- customers create-admin-warranty-activation-request warranty-activation-requests --runInBand
pnpm --filter @repo/admin test
```

- [ ] **Step 3: Run typechecks sequentially**

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/api check-types
pnpm --filter @repo/admin check-types
```

- [ ] **Step 4: Run lint sequentially**

```bash
pnpm --filter @repo/api lint
pnpm --filter @repo/admin lint
```

- [ ] **Step 5: Check patch integrity**

```bash
git diff --check
git status --short
```

- [ ] **Step 6: Manual smoke flow**

1. Create/edit a Customer with birthdate `11/12/2005`.
2. Select that Customer in Admin activation and confirm prefill.
3. Submit the request and verify both Customer profile and request detail show the date.
4. Select the Customer in another new request and confirm prefill.
5. Leave activation birthdate empty for a Customer that already has one and confirm the profile is not cleared.
