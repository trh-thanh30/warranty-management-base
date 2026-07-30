# Public Warranty Claim Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mocked public warranty progress page with real warranty-claim data and a sanitized, timestamped timeline returned by the existing public claim lookup endpoints.

**Architecture:** Keep Admin and Public contracts separate. `WarrantyClaimsRepository` continues to load the claim and its histories once; a dedicated public mapper produces a safe `PublicWarrantyClaimSummary` containing a synthesized initial submission event plus sanitized status and service-center events. Web calls the existing public lookup-by-code endpoint through the shared HTTP client and renders the returned timeline without deriving fake timestamps.

**Tech Stack:** NestJS, Prisma, TypeScript, Next.js 16, TanStack Query, React Hook Form, Zod, next-intl, shadcn-style `@repo/ui`, Tailwind CSS, Jest, Node test runner.

## Global Constraints

- Admin endpoints and Admin response contracts must remain unchanged.
- Public timeline must not expose Admin IDs, Admin accounts, Admin email, internal notes, or service-center transfer reasons.
- Public tracking accepts only the 80-bit random `CLM-<20 hex characters>` format; do not add phone-number lookup.
- Reuse the existing `GET /api/v1/public/warranty-claims/by-code/:claimCode` endpoint rather than adding a second public timeline request.
- `GET /api/v1/public/warranty-claims/by-warranty-code/:warrantyCode` must return the same timeline contract for every claim.
- Synthesize the initial `SUBMITTED` event from `submittedAt`; render only real recorded events after it.
- Apply a public read rate limit of 10 requests per 60 seconds to both claim lookup endpoints.
- Keep the route page thin and place client behavior under `apps/web/src/views/warranty`.

---

### Task 1: Define The Sanitized Public Timeline Contract

**Files:**

- Modify: `packages/shared/src/types/warranty-claim.types.ts`
- Test: `apps/api/src/modules/public/use-cases/public.use-cases.spec.ts`

**Interfaces:**

- Produces:

```ts
export type PublicWarrantyClaimStatusTimelineItem = {
  type: "STATUS_CHANGED";
  status: WarrantyClaimStatus;
  createdAt: string;
};

export type PublicWarrantyClaimServiceCenterTimelineItem = {
  type: "SERVICE_CENTER_ASSIGNED" | "SERVICE_CENTER_CHANGED";
  serviceCenterName: string;
  createdAt: string;
};

export type PublicWarrantyClaimTimelineItem =
  | PublicWarrantyClaimStatusTimelineItem
  | PublicWarrantyClaimServiceCenterTimelineItem;
```

- Extends `PublicWarrantyClaimSummary` with:

```ts
timeline: PublicWarrantyClaimTimelineItem[];
```

- [ ] **Step 1: Write the failing public mapper test**

Extend the existing public claim test with status and service-center histories:

```ts
const result = toPublicWarrantyClaimResponse({
  claim_code: "CLM-0123456789ABCDEFABCD",
  warranty_code: "WM-2026-ABCDEF",
  issue_title: "May khong hoat dong",
  status: "REVIEWING",
  priority: "NORMAL",
  due_at: new Date("2026-07-06T00:00:00.000Z"),
  submitted_at: new Date("2026-07-03T00:00:00.000Z"),
  resolved_at: null,
  status_history: [
    {
      to_status: "REVIEWING",
      created_at: new Date("2026-07-03T08:00:00.000Z"),
      note: "Internal eligibility note",
      changed_by_user_id: "admin-id",
      changed_by: { email: "admin@example.com" },
    },
  ],
  service_center_history: [
    {
      from_service_center_name: null,
      to_service_center_name: "Hanoi Warranty Center",
      created_at: new Date("2026-07-03T09:00:00.000Z"),
      note: "Internal assignment reason",
      changed_by_user_id: "admin-id",
      changed_by: { email: "admin@example.com" },
    },
  ],
  product: null,
  service_center: null,
});

expect(result.timeline).toEqual([
  {
    type: "STATUS_CHANGED",
    status: "SUBMITTED",
    createdAt: "2026-07-03T00:00:00.000Z",
  },
  {
    type: "STATUS_CHANGED",
    status: "REVIEWING",
    createdAt: "2026-07-03T08:00:00.000Z",
  },
  {
    type: "SERVICE_CENTER_ASSIGNED",
    serviceCenterName: "Hanoi Warranty Center",
    createdAt: "2026-07-03T09:00:00.000Z",
  },
]);
expect(JSON.stringify(result.timeline)).not.toContain("admin");
expect(JSON.stringify(result.timeline)).not.toContain("Internal");
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --filter @repo/api test -- --runInBand modules/public/use-cases/public.use-cases.spec.ts
```

Expected: FAIL because `timeline` does not exist.

- [ ] **Step 3: Add the shared timeline types**

Add the three public timeline types above and the required `timeline` property to `PublicWarrantyClaimSummary`. Do not reuse `WarrantyClaimTimelineItem`, because that Admin type exposes internal actors, notes, IDs, and reasons.

- [ ] **Step 4: Run shared type checking**

Run:

```bash
pnpm --filter @repo/shared check-types
```

Expected: PASS, or fail only where the public mapper has not yet populated the new required field.

- [ ] **Step 5: Commit the contract**

```bash
git add packages/shared/src/types/warranty-claim.types.ts apps/api/src/modules/public/use-cases/public.use-cases.spec.ts
git commit -m "feat(shared): define public warranty claim timeline"
```

---

### Task 2: Map Timeline Data Into The Existing Public Endpoints

**Files:**

- Create: `apps/api/src/modules/public/mappers/public-warranty-claim.mapper.ts`
- Modify: `apps/api/src/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case.ts`
- Modify: `apps/api/src/modules/public/use-cases/public-lookup-warranty-claims-by-warranty-code.use-case.ts`
- Modify: `apps/api/src/modules/public/public.controller.ts`
- Test: `apps/api/src/modules/public/use-cases/public.use-cases.spec.ts`

**Interfaces:**

- Consumes: `PublicWarrantyClaimSummary` and `PublicWarrantyClaimTimelineItem`.
- Produces:

```ts
export function toPublicWarrantyClaimResponse(
  claim: PublicWarrantyClaimSource,
): PublicWarrantyClaimSummary;
```

- [ ] **Step 1: Move the existing public mapper into its own file**

Move `toPublicWarrantyClaimResponse` out of the lookup use case and update both public lookup use cases to import it from:

```ts
@/modules/public/mappers/public-warranty-claim.mapper
```

The lookup use cases remain responsible only for normalization, lookup, not-found behavior, and calling the mapper.

- [ ] **Step 2: Implement the sanitized timeline mapper**

Build the timeline as follows:

```ts
const timeline: PublicWarrantyClaimTimelineItem[] = [
  {
    type: "STATUS_CHANGED",
    status: "SUBMITTED",
    createdAt: claim.submitted_at.toISOString(),
  },
  ...(claim.status_history ?? []).map((event) => ({
    type: "STATUS_CHANGED" as const,
    status: event.to_status,
    createdAt: event.created_at.toISOString(),
  })),
  ...(claim.service_center_history ?? []).map((event) => ({
    type: event.from_service_center_name
      ? ("SERVICE_CENTER_CHANGED" as const)
      : ("SERVICE_CENTER_ASSIGNED" as const),
    serviceCenterName: event.to_service_center_name,
    createdAt: event.created_at.toISOString(),
  })),
].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
```

Return this timeline with the existing public claim fields. Explicitly serialize all public date fields to ISO strings:

```ts
dueAt: claim.due_at?.toISOString() ?? null,
submittedAt: claim.submitted_at.toISOString(),
resolvedAt: claim.resolved_at?.toISOString() ?? null,
```

- [ ] **Step 3: Verify the mapper test passes**

Run:

```bash
pnpm --filter @repo/api test -- --runInBand modules/public/use-cases/public.use-cases.spec.ts
```

Expected: PASS for timeline ordering, initial submission synthesis, and privacy assertions.

- [ ] **Step 4: Write failing rate-limit tests**

Add source-level controller assertions for:

```ts
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Get("warranty-claims/by-code/:claimCode")
```

and:

```ts
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Get("warranty-claims/by-warranty-code/:warrantyCode")
```

- [ ] **Step 5: Run the rate-limit tests and verify RED**

Run the same focused Jest command. Expected: FAIL because neither public read endpoint currently has an explicit throttle.

- [ ] **Step 6: Add the two read throttles**

Add the decorators immediately above each corresponding `@Get`.

- [ ] **Step 7: Verify API tests and types**

Run:

```bash
pnpm --filter @repo/api test -- --runInBand modules/public/use-cases/public.use-cases.spec.ts
pnpm --filter @repo/api check-types
```

Expected: PASS.

- [ ] **Step 8: Commit the public API slice**

```bash
git add apps/api/src/modules/public packages/shared/src/types/warranty-claim.types.ts
git commit -m "feat(api): expose sanitized public claim timeline"
```

---

### Task 3: Add The Web Claim Tracking Data Layer

**Files:**

- Modify: `apps/web/src/services/warranty-claims/warranty-claims.service.ts`
- Create: `apps/web/src/hooks/use-warranty-claim-tracking.ts`
- Create: `apps/web/src/views/warranty/warranty-track-form.schema.ts`
- Create: `apps/web/tests/warranty-track-api.test.mjs`

**Interfaces:**

- Produces:

```ts
WarrantyClaimsService.getWarrantyClaimByCode(
  claimCode: string,
): Promise<PublicWarrantyClaimSummary>
```

```ts
useWarrantyClaimTracking(): {
  data: PublicWarrantyClaimSummary | undefined;
  errorKind: "notFound" | "rateLimit" | "request" | null;
  isPending: boolean;
  reset: () => void;
  track: (claimCode: string) => Promise<PublicWarrantyClaimSummary>;
}
```

- [ ] **Step 1: Write the failing service test**

Create `warranty-track-api.test.mjs` and assert that the service:

```ts
await service.getWarrantyClaimByCode(" clm-0123456789abcdefabcd ");
```

calls:

```ts
http.get("/public/warranty-claims/by-code/CLM-0123456789ABCDEFABCD");
```

and returns `response.data`.

- [ ] **Step 2: Run the Web test and verify RED**

Run:

```bash
pnpm --filter @repo/web test
```

Expected: FAIL because the service method does not exist.

- [ ] **Step 3: Implement the service method**

Expand the injected HTTP type from `Pick<HttpClient, "post">` to:

```ts
Pick<HttpClient, "get" | "post">;
```

Normalize with `trim().toUpperCase()` and protect the path with `encodeURIComponent`.

- [ ] **Step 4: Add the tracking hook**

Use `useMutation` because lookup occurs only after explicit form submission:

```ts
const mutation = useMutation({
  mutationFn: (claimCode: string) =>
    warrantyClaimsService.getWarrantyClaimByCode(claimCode),
});
```

Map errors:

```ts
if (error instanceof HttpClientError) {
  if (error.status === 404) return "notFound";
  if (error.status === 429) return "rateLimit";
}
return "request";
```

- [ ] **Step 5: Add the claim-code schema**

Create a Zod schema factory that trims, uppercases, and validates:

```ts
/^CLM\d{6,}$/;
```

The schema consumes one localized `claimCodeInvalid` message.

- [ ] **Step 6: Extend the test for hook and schema behavior**

Assert that:

- `404` maps to `notFound`.
- `429` maps to `rateLimit`.
- Unknown errors map to `request`.
- `" clm-0123456789abcdefabcd "` parses to `"CLM-0123456789ABCDEFABCD"`.
- Phone numbers and `WAR-...` activation codes are rejected.

- [ ] **Step 7: Verify the data layer**

Run:

```bash
pnpm --filter @repo/web test
pnpm --filter @repo/web check-types
```

Expected: PASS.

- [ ] **Step 8: Commit the Web data layer**

```bash
git add apps/web/src/services/warranty-claims apps/web/src/hooks/use-warranty-claim-tracking.ts apps/web/src/views/warranty/warranty-track-form.schema.ts apps/web/tests/warranty-track-api.test.mjs
git commit -m "feat(web): add public warranty claim tracking client"
```

---

### Task 4: Replace The Mock Tracking Page With The Real Timeline UI

**Files:**

- Modify: `apps/web/src/views/warranty/track.view.tsx`
- Create: `apps/web/src/views/warranty/components/warranty-track-form.tsx`
- Create: `apps/web/src/views/warranty/components/warranty-claim-progress.tsx`
- Create: `apps/web/src/views/warranty/warranty-track.constants.ts`
- Modify: `apps/web/src/views/warranty/warranty.constants.ts`
- Delete: `apps/web/src/views/warranty/warranty.types.ts`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/warranty-track-api.test.mjs`

**Interfaces:**

- Consumes: `PublicWarrantyClaimSummary`, `PublicWarrantyClaimTimelineItem`, `useWarrantyClaimTracking`, and `formatDate`.
- Produces a real `/[locale]/warranty/track` workflow with initial, loading, success, not-found, rate-limit, and generic-error states.

- [ ] **Step 1: Write the failing view composition test**

Assert that `track.view.tsx`:

- Uses `useWarrantyClaimTracking`.
- Composes `WarrantyTrackForm` and `WarrantyClaimProgress`.
- Does not import `demoWarrantyTicket`.
- Does not call `setTicketData`.

Assert that `WarrantyClaimProgress` references:

- `claim.timeline`.
- `claim.claimCode`.
- `claim.status`.
- `claim.product`.
- `claim.serviceCenter`.
- Shared `formatDate`.

- [ ] **Step 2: Run the Web tests and verify RED**

Run:

```bash
pnpm --filter @repo/web test
```

Expected: FAIL because the real tracking components do not exist.

- [ ] **Step 3: Implement the tracking form**

Use the existing shadcn-style form primitives:

```ts
Form;
FormControl;
FormField;
FormItem;
FormLabel;
FormMessage;
Input;
Button;
```

Requirements:

- One claim-code input.
- React Hook Form with Zod resolver.
- Submit calls `track(claimCode)`.
- Disable the button and show localized loading text while pending.
- Display specific localized toast errors for not found, rate limit, and network failure.
- Use `rounded-md`, a one-column mobile layout, and an inline input/button layout from `sm` upward.

- [ ] **Step 4: Define status and priority presentation**

In `warranty-track.constants.ts`, define exhaustive presentation maps:

```ts
Record<
  WarrantyClaimStatus,
  {
    labelKey: string;
    tone: "neutral" | "warning" | "success" | "danger";
  }
>;
```

and:

```ts
Record<WarrantyClaimPriority, string>;
```

Do not hardcode Vietnamese labels in TSX.

- [ ] **Step 5: Implement the claim progress component**

Render:

- Claim code and current status badge.
- Warranty code, issue title, priority, submission date, due date, and resolved date when present.
- Product name, brand, and model when `product` is non-null.
- Assigned service-center contact block when `serviceCenter` is non-null.
- Chronological timeline from `claim.timeline`.

Timeline event rules:

```ts
STATUS_CHANGED -> localized status label
SERVICE_CENTER_ASSIGNED -> localized "Assigned to {name}"
SERVICE_CENTER_CHANGED -> localized "Transferred to {name}"
```

Every event displays its real `createdAt` using:

```ts
formatDate(event.createdAt, { locale, showTime: true });
```

Do not render unrecorded future steps or fabricate timestamps.

- [ ] **Step 6: Remove tracking mock state**

Delete `demoWarrantyTicket` from `warranty.constants.ts`. Delete `warranty.types.ts`, because `WarrantyTicketResult` is only used by the mock tracking page. Leave unrelated warranty demo data unchanged.

- [ ] **Step 7: Replace tracking messages in both locales**

Remove the `mock` message group and add matching Vietnamese/English keys for:

- Claim-code label, placeholder, invalid message.
- Submit and loading labels.
- Error messages: not found, rate limit, request.
- Result labels for claim, warranty, issue, priority, submitted, due, resolved, product, service center.
- All seven claim statuses.
- All four priorities.
- Timeline title.
- Status-change, service-center-assigned, and service-center-changed event text.

- [ ] **Step 8: Verify locale parity and responsive source rules**

Extend the Web test to assert:

- Vietnamese and English tracking key paths match.
- No mock copy remains.
- No arbitrary rounded values such as `rounded-[28px]` or `rounded-[14px]` remain in the tracking view/components.
- The result component handles nullable product, service center, due date, and resolved date.

- [ ] **Step 9: Run Web verification**

Run:

```bash
pnpm --filter @repo/web test
pnpm --filter @repo/web lint
pnpm --filter @repo/web check-types
```

Expected: PASS.

- [ ] **Step 10: Commit the tracking UI**

```bash
git add apps/web/src/views/warranty apps/web/src/messages apps/web/tests/warranty-track-api.test.mjs
git commit -m "feat(web): render real warranty claim progress"
```

---

### Task 5: Run Cross-Package Regression Verification

**Files:**

- No production files should change in this task.

**Interfaces:**

- Verifies the complete shared → API → Web contract.

- [ ] **Step 1: Build shared contracts**

```bash
pnpm --filter @repo/shared build
```

Expected: PASS and regenerated `packages/shared/dist` artifacts.

- [ ] **Step 2: Run focused API tests**

```bash
pnpm --filter @repo/api test -- --runInBand modules/public/use-cases/public.use-cases.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Run the complete Web suite**

```bash
pnpm --filter @repo/web test
```

Expected: PASS.

- [ ] **Step 4: Run type checking**

```bash
pnpm --filter @repo/api check-types
pnpm --filter @repo/web check-types
```

Expected: PASS.

- [ ] **Step 5: Run lint on changed packages**

```bash
pnpm --filter @repo/api lint
pnpm --filter @repo/web lint
```

Expected: PASS with no new errors or warnings from changed files.

- [ ] **Step 6: Check the final diff**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the planned shared, API, Web, test, and message files are modified.
