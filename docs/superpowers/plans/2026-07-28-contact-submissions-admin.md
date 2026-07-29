# Contact Submissions Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real contact-message pipeline: Web submits the contact form to the API, and Admin can list, inspect, and manage incoming submissions.

**Architecture:** Add a new backend module `contact-submissions` following controller -> use case -> repository. Put API contracts in `packages/shared`, keep Admin/Web services in their app `src/services`, and keep page components under feature-specific `src/views/contact-submissions`. The first release stores submissions and supports status management; email notification is intentionally out of scope.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Next.js App Router, React Hook Form, Zod, TanStack Query, `@repo/shared`, `@repo/ui`.

## Global Constraints

- Keep `app/**/page.tsx` thin and render a view from `src/views`.
- Backend business logic belongs in use cases, not controllers.
- Shared request/response contracts belong in `packages/shared/src/types`.
- Public form submit must be unauthenticated; Admin list/detail/update must require permissions.
- Contact form has no file upload in this phase.
- Do not add email sending until persisted submissions and Admin workflow are stable.

---

## File Structure

- Create `packages/shared/src/types/contact-submission.types.ts`: shared DTOs, status enum, list query, create body, update status body.
- Modify `packages/shared/src/types/index.ts`: export contact submission types.
- Modify `apps/api/prisma/schema.prisma`: add `ContactSubmission` model and enum.
- Create migration under `apps/api/prisma/migrations/<timestamp>_add_contact_submissions/migration.sql`.
- Create `apps/api/src/modules/contact-submissions/*`: module, controller, dto, repository, use cases, tests.
- Modify `apps/api/src/app.module.ts`: import `ContactSubmissionsModule`.
- Modify Web contact form service/hooks: submit to `POST /public/contact-submissions`.
- Create Admin service folder `apps/admin/src/services/contact-submissions`.
- Create Admin route `apps/admin/app/[locale]/(dashboard)/contact-submissions/page.tsx`.
- Create Admin view folder `apps/admin/src/views/contact-submissions`.
- Modify Admin navigation/messages/permissions so the page is reachable.

---

### Task 1: Shared Contract And Database Model

**Files:**

- Create: `packages/shared/src/types/contact-submission.types.ts`
- Modify: `packages/shared/src/types/index.ts`
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_add_contact_submissions/migration.sql`

**Interfaces:**

- Produces `CreateContactSubmissionBody`, `ContactSubmissionResponse`, `ListContactSubmissionsQuery`, `UpdateContactSubmissionStatusBody`.
- Produces Prisma model `contact_submission`.

- [ ] **Step 1: Define shared types**

```ts
import type { PaginationQuery, PaginatedResponse } from "./pagination.types.ts";

export type ContactSubmissionStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "ARCHIVED";

export type ContactSubmissionResponse = {
  id: string;
  fullName: string;
  phone: string;
  content: string;
  status: ContactSubmissionStatus;
  sourcePath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateContactSubmissionBody = {
  fullName: string;
  phone: string;
  content: string;
  sourcePath?: string | null;
};

export type ListContactSubmissionsQuery = PaginationQuery & {
  search?: string;
  status?: ContactSubmissionStatus;
};

export type ListContactSubmissionsResponse =
  PaginatedResponse<ContactSubmissionResponse>;

export type UpdateContactSubmissionStatusBody = {
  status: Exclude<ContactSubmissionStatus, "NEW"> | "NEW";
};
```

- [ ] **Step 2: Add Prisma model**

```prisma
enum contact_submission_status {
  NEW
  IN_PROGRESS
  RESOLVED
  ARCHIVED
}

model ContactSubmission {
  id          String                    @id @default(uuid())
  full_name   String
  phone       String
  content     String
  status      contact_submission_status @default(NEW)
  source_path String?
  created_at  DateTime                  @default(now())
  updated_at  DateTime                  @updatedAt

  @@index([status, created_at])
  @@index([created_at])
  @@map("contact_submissions")
}
```

- [ ] **Step 3: Add SQL migration**

Create enum/table/indexes matching the Prisma model. The migration must use snake_case DB names from the model mapping.

- [ ] **Step 4: Verify shared export**

Run: `rg -n "contact-submission" packages/shared/src/types apps/api/prisma`

Expected: type file, index export, schema model, and migration are present.

---

### Task 2: Backend Public Submit And Admin Management API

**Files:**

- Create: `apps/api/src/modules/contact-submissions/contact-submissions.module.ts`
- Create: `apps/api/src/modules/contact-submissions/contact-submissions.controller.ts`
- Create: `apps/api/src/modules/contact-submissions/dto/contact-submission.dto.ts`
- Create: `apps/api/src/modules/contact-submissions/repository/contact-submissions.repository.ts`
- Create: `apps/api/src/modules/contact-submissions/use-cases/create-contact-submission.use-case.ts`
- Create: `apps/api/src/modules/contact-submissions/use-cases/list-contact-submissions.use-case.ts`
- Create: `apps/api/src/modules/contact-submissions/use-cases/get-contact-submission.use-case.ts`
- Create: `apps/api/src/modules/contact-submissions/use-cases/update-contact-submission-status.use-case.ts`
- Create: `apps/api/src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**

- Consumes shared DTOs from Task 1.
- Produces API endpoints:
  - `POST /api/v1/public/contact-submissions`
  - `GET /api/v1/contact-submissions`
  - `GET /api/v1/contact-submissions/:id`
  - `PATCH /api/v1/contact-submissions/:id/status`

- [ ] **Step 1: Write use case tests**

Cover:

- create trims `fullName`, `phone`, `content`
- create rejects content shorter than 10
- list maps pagination and status/search filters
- get returns not found for unknown id
- update status changes only the status field

- [ ] **Step 2: Implement DTO validation**

Use `class-validator`:

- `fullName`: string, min 2, max 120
- `phone`: string, matches `/^[0-9+\s().-]{8,20}$/`
- `content`: string, min 10, max 2000
- `sourcePath`: optional string, max 300
- `status`: enum `NEW | IN_PROGRESS | RESOLVED | ARCHIVED`

- [ ] **Step 3: Implement repository**

Repository methods:

- `create(input: CreateContactSubmissionBody): Promise<ContactSubmissionResponse>`
- `list(query: ListContactSubmissionsQuery): Promise<ListContactSubmissionsResponse>`
- `findById(id: string): Promise<ContactSubmissionResponse | null>`
- `updateStatus(id: string, status: ContactSubmissionStatus): Promise<ContactSubmissionResponse | null>`

- [ ] **Step 4: Implement controller**

Use `@Public()` only on `POST /public/contact-submissions`.
Protect Admin endpoints with permissions. If no dedicated permission exists yet, add one in the existing permission seed/enum flow rather than reusing unrelated website config permission.

- [ ] **Step 5: Verify**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
pnpm.cmd --filter @repo/api check-types
```

Expected: contact submission tests pass and API typecheck passes.

---

### Task 3: Web Contact Form Submit

**Files:**

- Create: `apps/web/src/services/contact-submissions/contact-submissions.service.ts`
- Modify: `apps/web/src/views/contact/components/contact-message-form.tsx`
- Modify: `apps/web/tests/contact-form.test.mjs`

**Interfaces:**

- Consumes `CreateContactSubmissionBody` from `@repo/shared`.
- Calls `POST /public/contact-submissions`.

- [ ] **Step 1: Add Web service**

Service method:

```ts
async createContactSubmission(input: CreateContactSubmissionBody): Promise<ContactSubmissionResponse>
```

- [ ] **Step 2: Update form submit**

On valid submit:

- set pending state
- call service with `fullName`, `phone`, `content`, `sourcePath: window.location.pathname`
- show success only after API success
- show localized error when API fails
- reset form after success

- [ ] **Step 3: Verify**

Run:

```powershell
node --test apps\web\tests\contact-form.test.mjs
```

Expected: tests prove form uses service and keeps shadcn-style validation.

---

### Task 4: Admin Service, Route, And List Page

**Files:**

- Create: `apps/admin/src/services/contact-submissions/contact-submissions.service.ts`
- Create: `apps/admin/src/services/contact-submissions/create-contact-submissions.service.ts`
- Create: `apps/admin/app/[locale]/(dashboard)/contact-submissions/page.tsx`
- Create: `apps/admin/src/views/contact-submissions/contact-submissions.view.tsx`
- Create: `apps/admin/src/views/contact-submissions/components/contact-submissions-directory-card.tsx`
- Create: `apps/admin/src/views/contact-submissions/components/contact-submissions-table.tsx`
- Create: `apps/admin/src/views/contact-submissions/contact-submissions.constants.ts`
- Create: `apps/admin/src/views/contact-submissions/hooks/use-contact-submissions-directory.ts`
- Modify: Admin navigation constants/messages.

**Interfaces:**

- Consumes Admin endpoints from Task 2.
- Produces route `/contact-submissions`.

- [ ] **Step 1: Add Admin service**

Methods:

- `listContactSubmissions(query: ListContactSubmissionsQuery)`
- `getContactSubmission(id: string)`
- `updateContactSubmissionStatus(id: string, body: UpdateContactSubmissionStatusBody)`

- [ ] **Step 2: Add list UI**

List page includes:

- search by name/phone/content
- status filter
- newest-first default sort
- pagination
- table columns: requester, phone, content preview, status, created date, actions
- mobile stacked rows matching existing Admin table patterns

- [ ] **Step 3: Add status update action**

Inline actions:

- mark `NEW -> IN_PROGRESS`
- mark `IN_PROGRESS -> RESOLVED`
- archive any non-archived submission

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm.cmd --filter @repo/admin test
pnpm.cmd --filter @repo/admin lint
```

Expected: Admin tests/lint pass after dependency state is healthy.

---

### Task 5: Admin Detail Drawer Or Detail Page

**Files:**

- Preferred simple path: extend `contact-submissions.view.tsx` with a detail drawer component.
- Create: `apps/admin/src/views/contact-submissions/components/contact-submission-detail-drawer.tsx`

**Interfaces:**

- Consumes `ContactSubmissionResponse`.

- [ ] **Step 1: Add detail drawer**

Show:

- full name
- phone with `tel:` link
- full content
- source path
- created/updated timestamps
- current status
- status transition buttons

- [ ] **Step 2: Add empty/loading/error states**

Use existing Admin state components if available. Keep copy in `apps/admin/src/messages/vi.json` and `en.json`.

- [ ] **Step 3: Verify**

Run Admin source-level tests for route wiring and message keys.

---

## Self-Review

- Spec coverage: covers persistence, public submit, Admin list, detail, status management, shared contract.
- Placeholder scan: no deferred implementation steps; email notification deliberately excluded.
- Type consistency: all service and DTO names align across shared, API, Web, and Admin.

## Execution Choice

Plan complete. Recommended commit grouping:

1. `feat(api): add contact submissions persistence`
2. `feat(web): submit contact messages to api`
3. `feat(admin): add contact submissions dashboard`
