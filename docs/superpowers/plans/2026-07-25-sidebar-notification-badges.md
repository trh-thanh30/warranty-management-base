# Sidebar Notification Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show unread notification counts beside the Warranties and Warranty Claims sidebar items while keeping the notification bell total synchronized.

**Architecture:** Add a notification use case that reduces unread notification types returned by the repository into one shared response contract. The admin consumes the existing React Query unread-count query and resolves badge values from semantic keys stored on navigation items.

**Tech Stack:** NestJS, Prisma, Next.js, React Query, TypeScript, Tailwind CSS, Jest, Node test runner.

## Global Constraints

- Use one `GET /notifications/unread-count` request for the bell and sidebar.
- Warranty Claims only includes `WARRANTY_CLAIM_CREATED`.
- Warranties includes `WARRANTY_ACTIVATION_REQUEST_CREATED`.
- Zero counts are hidden and counts above 99 render as `99+`.
- Reading notifications invalidates the existing shared notification query.
- Do not mark notifications read when navigating from the sidebar.

---

### Task 1: Group unread notification counts in the API

**Files:**

- Modify: `packages/shared/src/types/notification.types.ts`
- Modify: `apps/api/src/modules/notification/repository/notification.repository.ts`
- Create: `apps/api/src/modules/notification/use-cases/get-unread-notification-count.use-case.ts`
- Create: `apps/api/src/modules/notification/tests/get-unread-notification-count.use-case.spec.ts`
- Modify: `apps/api/src/modules/notification/service/notification.service.ts`
- Modify: `apps/api/src/modules/notification/notification.controller.ts`
- Modify: `apps/api/src/modules/notification/notification.module.ts`

**Interfaces:**

- Repository produces `Promise<string[]>` from `listUnreadTypes(userId)`.
- Use case produces `Promise<UnreadNotificationCount>`.
- Shared contract contains `unread`, `warranties`, and `warrantyClaims`.

- [ ] **Step 1: Write the failing use-case tests**

```ts
it("groups unread types into sidebar counters", async () => {
  const repository = {
    listUnreadTypes: jest
      .fn()
      .mockResolvedValue([
        "WARRANTY_CLAIM_CREATED",
        "WARRANTY_CLAIM_STATUS_CHANGED",
        "WARRANTY_ACTIVATION_REQUEST_CREATED",
        "OTHER",
      ]),
  };
  const useCase = new GetUnreadNotificationCountUseCase(repository as never);

  await expect(useCase.execute("user-1")).resolves.toEqual({
    unread: 4,
    warranties: 1,
    warrantyClaims: 2,
  });
});

it("returns zero counters when no unread notification exists", async () => {
  const repository = { listUnreadTypes: jest.fn().mockResolvedValue([]) };
  const useCase = new GetUnreadNotificationCountUseCase(repository as never);

  await expect(useCase.execute("user-1")).resolves.toEqual({
    unread: 0,
    warranties: 0,
    warrantyClaims: 0,
  });
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```bash
pnpm --filter @repo/api test -- --runInBand src/modules/notification/tests/get-unread-notification-count.use-case.spec.ts
```

Expected: FAIL because `GetUnreadNotificationCountUseCase` does not exist.

- [ ] **Step 3: Add the contract, repository query, and use case**

```ts
export type UnreadNotificationCount = {
  unread: number;
  warranties: number;
  warrantyClaims: number;
};
```

```ts
async listUnreadTypes(userId: string) {
  const recipients = await this.prisma.notificationRecipient.findMany({
    where: {
      user_id: userId,
      status: notification_read_status.UNREAD,
      notification: { delivery_status: notification_delivery_status.SENT },
    },
    select: { notification: { select: { type: true } } },
  });

  return recipients.map(({ notification }) => notification.type);
}
```

```ts
async execute(userId: string): Promise<UnreadNotificationCount> {
  const types = await this.notificationRepository.listUnreadTypes(userId);
  return {
    unread: types.length,
    warranties: types.filter(
      (type) => type === 'WARRANTY_ACTIVATION_REQUEST_CREATED',
    ).length,
    warrantyClaims: types.filter(
      (type) => type === 'WARRANTY_CLAIM_CREATED',
    ).length,
  };
}
```

Wire the use case through the service, controller, and module provider list.

- [ ] **Step 4: Run the targeted test and verify GREEN**

Run the command from Step 2.

Expected: PASS.

### Task 2: Resolve and render sidebar badges

**Files:**

- Modify: `apps/admin/src/config/dashboard.types.ts`
- Modify: `apps/admin/src/config/dashboard.config.ts`
- Create: `apps/admin/src/components/layout/app-sidebar.utils.ts`
- Create: `apps/admin/src/components/layout/app-sidebar.utils.test.ts`
- Modify: `apps/admin/src/components/layout/app-sidebar.tsx`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`

**Interfaces:**

- Navigation items use `notificationBadgeKey?: "warranties" | "warrantyClaims"`.
- `getNavigationBadge(count, hasError)` returns `string | null`.
- `AppSidebar` consumes `useUnreadNotificationCount`.

- [ ] **Step 1: Write failing formatter tests**

```ts
test("hides empty and unavailable notification badges", () => {
  assert.equal(getNavigationBadge(0, false), null);
  assert.equal(getNavigationBadge(3, true), null);
});

test("formats visible notification badges", () => {
  assert.equal(getNavigationBadge(12, false), "12");
  assert.equal(getNavigationBadge(100, false), "99+");
});
```

- [ ] **Step 2: Run admin tests and verify RED**

Run:

```bash
pnpm --filter @repo/admin test
```

Expected: FAIL because `getNavigationBadge` does not exist.

- [ ] **Step 3: Implement semantic keys and badge formatting**

```ts
export type NotificationBadgeKey = "warranties" | "warrantyClaims";

export function getNavigationBadge(count: number, hasError: boolean) {
  if (hasError || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}
```

Assign the keys to `/warranties` and `/warranty-claims`. Query unread counts once
inside `AppSidebar`, resolve the current item's count, and render the existing
Badge in expanded mode. In collapsed mode render an absolutely positioned
compact red badge anchored to the link, without changing link dimensions.

Add localized screen-reader strings:

```json
"unreadNotifications": "{count} unread notifications"
```

```json
"unreadNotifications": "{count} thông báo chưa đọc"
```

- [ ] **Step 4: Run admin tests and verify GREEN**

Run the command from Step 2.

Expected: PASS.

### Task 3: Verify integration and quality

**Files:**

- Verify all files from Tasks 1 and 2.

**Interfaces:**

- API and admin compile against the same `UnreadNotificationCount` contract.

- [ ] **Step 1: Run focused API and admin tests**

```bash
pnpm --filter @repo/api test -- --runInBand src/modules/notification/tests/get-unread-notification-count.use-case.spec.ts
pnpm --filter @repo/admin test
```

Expected: PASS.

- [ ] **Step 2: Run lint and type checks**

```bash
pnpm --filter @repo/api lint
pnpm --filter @repo/api check-types
pnpm --filter @repo/admin lint
pnpm --filter @repo/admin check-types
```

Expected: PASS, except any already-known unrelated dependency/type failures must
be reported with their exact output.

- [ ] **Step 3: Review the final diff**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the feature, design, and plan files are
changed.
