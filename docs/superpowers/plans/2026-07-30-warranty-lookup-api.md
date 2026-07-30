# Warranty Lookup API Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock warranty lookup data on the public page and modal with the existing public warranty lookup API.

**Architecture:** A Web warranty service owns the HTTP contract and returns the shared `WarrantyLookupResult`. A reusable mutation hook owns request state and error classification. The page and modal remain separate presentations but consume the same hook and only render fields returned by the API.

**Tech Stack:** Next.js, React, TanStack Query, next-intl, shared Axios HTTP client, Node test runner.

## Global Constraints

- Do not change the Backend endpoint or expose customer PII.
- Do not retain mock fallback data when lookup fails.
- Keep route `page.tsx` files thin.
- Use types from `packages/shared` for API request and response contracts.
- Preserve Vietnamese and English message key parity.

---

### Task 1: Warranty lookup service

**Files:**

- Create: `apps/web/src/services/warranties/warranties.service.ts`
- Create: `apps/web/tests/warranty-lookup-api.test.mjs`

**Interfaces:**

- Produces: `WarrantiesService.lookupWarranty(code, signal?)`
- Consumes: `GET /public/warranties/lookup?code=<normalized-code>`

- [x] Write a failing service contract test.
- [x] Run the test and confirm the missing module failure.
- [x] Implement the typed service using `publicHttpClient`.
- [x] Run the test and confirm it passes.

### Task 2: Shared lookup state

**Files:**

- Create: `apps/web/src/hooks/use-warranty-lookup.ts`
- Modify: `apps/web/tests/warranty-lookup-api.test.mjs`

**Interfaces:**

- Produces: query mutation state plus `lookup(code)` and `reset()`.
- Consumes: `WarrantiesService.lookupWarranty`.

- [x] Add a source contract test for one reusable lookup hook.
- [x] Implement the hook with TanStack Query mutation state.
- [x] Classify invalid input, not-found and generic request failures for UI translation.
- [x] Run the Web tests.

### Task 3: Page and modal integration

**Files:**

- Modify: `apps/web/src/views/warranty/lookup.view.tsx`
- Modify: `apps/web/src/components/warranty-lookup-modal.tsx`
- Modify: `apps/web/src/views/warranty/warranty.types.ts`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Modify: `apps/web/tests/warranty-lookup-api.test.mjs`

**Interfaces:**

- Consumes: `useWarrantyLookup`.
- Renders: product name, brand/model, serial number, warranty code, start date, end date and status.

- [x] Add failing source tests proving Page and Modal no longer use mock lookup data.
- [x] Replace local mock state with the shared lookup hook.
- [x] Remove unsupported customer, vehicle, dealer and film result fields.
- [x] Add localized loading, required-input, invalid, not-found and request error states.
- [x] Run Web tests, lint, type-check where dependencies permit, and review the final diff.
