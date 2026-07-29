# Contact Submission Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an unread notification for each new public contact submission and expose its count in the Admin notification bell and contact-submissions sidebar item.

**Architecture:** Reuse the existing role-scoped notification subsystem. A contact-owned notification service converts persisted submissions into system notifications and swallows publisher failures, while the existing unread-count endpoint remains the single source for bell and sidebar badges.

**Tech Stack:** NestJS, Prisma, Jest, Next.js, TanStack Query, Node test runner, TypeScript.

## Global Constraints

- Notify active `ADMIN` and `MODERATOR` users.
- Publish only after a contact submission is persisted successfully.
- Notification failure must not fail the public contact request.
- Publish only for creation, not for status transitions.
- Clicking a bell item only marks it read and never navigates.
- Sidebar badge represents unread creation notifications, not `NEW` or `IN_PROGRESS` records.
- Do not add a database migration or a new polling endpoint.

---

### Task 1: Shared Notification Contract And Unread Counter

**Files:**

- Modify: `packages/shared/src/constants/notification.ts`
- Modify: `packages/shared/src/types/notification.types.ts`
- Modify: `apps/api/src/modules/notification/tests/get-unread-notification-count.use-case.spec.ts`
- Modify: `apps/api/src/modules/notification/use-cases/get-unread-notification-count.use-case.ts`

**Interfaces:**

- Produces: `NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED`
- Produces: `UnreadNotificationCount.contactSubmissions: number`

- [ ] **Step 1: Write the failing unread-counter test**

Add `NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED` to the mixed unread types
and expect:

```ts
{
  contactSubmissions: 1,
  unread: 7,
  warranties: 1,
  warrantyClaims: 1,
}
```

Also expect zero results to include `contactSubmissions: 0`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/notification/tests/get-unread-notification-count.use-case.spec.ts
```

Expected: compilation or assertion failure because the notification type and
counter do not exist.

- [ ] **Step 3: Add the shared type and reducer branch**

Add:

```ts
CONTACT_SUBMISSION_CREATED: "CONTACT_SUBMISSION_CREATED",
```

Add `contactSubmissions: number` to `UnreadNotificationCount`, initialize it to
zero, and increment it only when the unread type equals the new constant.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the command from Step 2. Expected: all unread-count tests pass.

---

### Task 2: Contact Submission Notification Publisher

**Files:**

- Create: `apps/api/src/modules/contact-submissions/service/contact-submission-notification.service.ts`
- Modify: `apps/api/src/modules/contact-submissions/contact-submissions.module.ts`
- Modify: `apps/api/src/modules/contact-submissions/use-cases/create-contact-submission.use-case.ts`
- Modify: `apps/api/src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts`

**Interfaces:**

- Consumes: `NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED`
- Consumes: `CreateSystemNotificationUseCase`
- Produces: `ContactSubmissionNotificationService.submissionCreated(submission)`

- [ ] **Step 1: Write failing creation-flow tests**

Extend the create-use-case fixture with:

```ts
const contactSubmissionNotificationService = {
  submissionCreated: jest.fn(),
};
```

Inject it into `CreateContactSubmissionUseCase`. After a successful repository
create, expect:

```ts
expect(
  contactSubmissionNotificationService.submissionCreated,
).toHaveBeenCalledWith(baseSubmission);
```

For invalid input, pending-phone conflict, and Prisma `P2002`, assert that the
publisher is not called.

- [ ] **Step 2: Write failing publisher service tests**

Instantiate `ContactSubmissionNotificationService` with a mocked
`CreateSystemNotificationUseCase`. Assert the service publishes:

```ts
{
  title: "New contact submission from Nguyen Van A",
  content: "A new consultation request has been submitted by Nguyen Van A.",
  type: NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED,
  scope: notification_scope.ROLE,
  target_roles: [user_role.ADMIN, user_role.MODERATOR],
  metadata: {
    submissionId: baseSubmission.id,
    fullName: baseSubmission.full_name,
    phone: baseSubmission.phone,
    consultationTopic: baseSubmission.consultation_topic,
    provinceCode: baseSubmission.province_code,
    provinceName: baseSubmission.province_name,
    status: baseSubmission.status,
  },
}
```

When the mocked system publisher rejects, expect
`submissionCreated(baseSubmission)` to resolve without throwing.

- [ ] **Step 3: Run contact tests and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
```

Expected: failure because the service and constructor dependency do not exist.

- [ ] **Step 4: Implement the fail-soft publisher**

Create an injectable service following
`WarrantyActivationRequestNotificationService`. Wrap the system notification
call in `try/catch` and log:

```ts
`Could not publish contact submission notification: ${
  error instanceof Error ? error.message : String(error)
}`;
```

- [ ] **Step 5: Wire the module and creation use case**

Import `NotificationModule`, register
`ContactSubmissionNotificationService`, inject it into
`CreateContactSubmissionUseCase`, and call:

```ts
await this.contactSubmissionNotificationService.submissionCreated(submission);
```

Call it only after `repository.create` succeeds and before mapping the response.

- [ ] **Step 6: Run contact tests and verify GREEN**

Run the command from Step 3. Expected: all contact tests pass.

---

### Task 3: Admin Sidebar Badge Binding

**Files:**

- Modify: `apps/admin/src/config/dashboard.types.ts`
- Modify: `apps/admin/src/config/dashboard.config.ts`
- Modify: `apps/admin/src/config/dashboard.config.test.ts`
- Modify: `apps/admin/src/components/layout/app-sidebar.utils.test.ts`

**Interfaces:**

- Consumes: `UnreadNotificationCount.contactSubmissions`
- Produces: navigation badge key `"contactSubmissions"`

- [ ] **Step 1: Write failing dashboard tests**

Assert the `/contact-submissions` item has:

```ts
notificationBadgeKey: "contactSubmissions";
```

Add a sidebar utility assertion with:

```ts
{
  contactSubmissions: 3,
  unread: 3,
  warranties: 0,
  warrantyClaims: 0,
}
```

Expected badge: `"3"`.

- [ ] **Step 2: Run Admin tests and verify RED**

Run:

```powershell
pnpm.cmd --filter @repo/admin test -- src/config/dashboard.config.test.ts src/components/layout/app-sidebar.utils.test.ts
```

Expected: type or assertion failure because the key is not supported.

- [ ] **Step 3: Add the key and navigation binding**

Extend `NotificationBadgeKey` with `"contactSubmissions"` and set that key on
the contact-submissions sidebar item. No notification-bell component change is
needed.

- [ ] **Step 4: Run Admin tests and verify GREEN**

Run the command from Step 2. Expected: both focused test files pass.

---

### Task 4: Integrated Verification

**Files:**

- Verify all files modified by Tasks 1-3.

- [ ] **Step 1: Run API verification**

```powershell
pnpm.cmd --filter @repo/api test -- --runInBand src/modules/notification/tests/get-unread-notification-count.use-case.spec.ts src/modules/contact-submissions/tests/contact-submissions.use-cases.spec.ts
pnpm.cmd --filter @repo/api check-types
pnpm.cmd --filter @repo/api exec eslint "src/modules/contact-submissions/**/*.ts" "src/modules/notification/**/*.ts" --quiet
```

- [ ] **Step 2: Run Admin verification**

```powershell
pnpm.cmd --filter @repo/admin test -- src/config/dashboard.config.test.ts src/components/layout/app-sidebar.utils.test.ts
pnpm.cmd --filter @repo/admin lint
```

- [ ] **Step 3: Check the final diff**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors and only the notification feature files plus
its approved spec/plan are changed.
