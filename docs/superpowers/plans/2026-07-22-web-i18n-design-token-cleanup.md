# Web i18n and Design Token Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public Web route consistently bilingual and compliant with the shared typography and color-token system.

**Architecture:** Keep route pages thin, store translated copy in feature-scoped next-intl namespaces, and keep language-neutral structure in feature constants. Add source-level regression guards before migrating shared UI and individual feature slices.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, next-intl 4, Node test runner.

## Global Constraints

- Do not add `"use client"` to `app/**/page.tsx`.
- Do not use arbitrary font-size utilities.
- Do not use raw hex color utilities in Web components or views.
- Do not use a font weight above `font-semibold`.
- User-facing text must come from next-intl messages unless it is language-neutral domain data.
- Preserve unrelated worktree changes.

---

### Task 1: Source Policy Guards

**Files:**

- Create: `apps/web/tests/source-policy.test.mjs`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: source files under `apps/web/src` and both locale JSON files.
- Produces: Node tests that report the exact violating file and token.

- [ ] Write tests that reject `text-[<number>px|rem]`, raw hex Tailwind color utilities, and mismatched locale message paths.
- [ ] Run `node --test apps/web/tests/source-policy.test.mjs` and confirm the typography and color assertions fail on current source.
- [ ] Keep the failing test active while migrating the following feature batches.

### Task 2: Shared Shell and Metadata

**Files:**

- Modify: `apps/web/app/[locale]/layout.tsx`
- Modify: `apps/web/src/components/layout/site-header.tsx`
- Modify: `apps/web/src/components/floating-quick-action.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: `SiteHeader`, next-intl locale messages, global theme tokens.
- Produces: localized metadata and shared controls with no visible hard-coded copy or raw hex utilities.

- [ ] Add failing source assertions for shared-shell translations and metadata.
- [ ] Replace layout metadata with locale-aware `generateMetadata` using `getTranslations`.
- [ ] Add a `FloatingQuickAction` namespace and translate labels and aria text.
- [ ] Replace shared-shell raw colors and arbitrary sizes with named tokens and the standard type scale.
- [ ] Run source tests, focused ESLint, and Web typecheck.

### Task 3: Home Feature

**Files:**

- Modify: `apps/web/src/views/home/home.constants.ts`
- Modify: `apps/web/src/views/home/home.view.tsx`
- Modify: `apps/web/src/views/home/components/*.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: language-neutral Home constants and the `HomePage` message namespace.
- Produces: localized Home sections using named color and typography tokens.

- [ ] Move visible Home copy into `HomePage` messages while retaining asset paths, IDs, product codes, and numeric specifications in constants.
- [ ] Move render-independent arrays out of component bodies.
- [ ] Replace arbitrary font sizes with the standard Tailwind scale.
- [ ] Replace raw hex utilities with global color tokens.
- [ ] Remove dead Home modal state or reconnect it only if its target UI is rendered.
- [ ] Run source tests, focused ESLint, and Web typecheck.

### Task 4: About and Products

**Files:**

- Modify/Create: `apps/web/src/views/about/about.constants.ts`
- Modify: `apps/web/src/views/about/about.view.tsx`
- Modify/Create: `apps/web/src/views/products/products.constants.ts`
- Modify: `apps/web/src/views/products/products.view.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Produces: `AboutPage` and `ProductsPage` namespaces with language-neutral gallery and product specification constants.

- [ ] Split static structure from translated content.
- [ ] Translate every visible label and descriptive alt string.
- [ ] Replace arbitrary typography and raw color utilities.
- [ ] Split private sections where a view remains too large to review safely.
- [ ] Run source tests, focused ESLint, and Web typecheck.

### Task 5: Warranty Feature

**Files:**

- Modify/Create: `apps/web/src/views/warranty/warranty.constants.ts`
- Modify: `apps/web/src/views/warranty/*.view.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Produces: a `Warranty` namespace shared by hub, lookup, activation, request, and tracking screens.

- [ ] Keep form values and domain status IDs language-neutral while translating their labels.
- [ ] Translate form labels, placeholders, options, success states, and accessibility text.
- [ ] Replace arbitrary typography and raw color utilities.
- [ ] Run source tests, focused ESLint, and Web typecheck.

### Task 6: Dealers and Remaining Content Routes

**Files:**

- Modify/Create: `apps/web/src/views/dealers/dealers.constants.ts`
- Modify/Create: `apps/web/src/views/dealers/use-dealer-filters.ts`
- Modify: `apps/web/src/views/dealers/dealers.view.tsx`
- Modify: `apps/web/src/views/contact/contact.view.tsx`
- Modify: `apps/web/src/views/policy/policy.view.tsx`
- Modify: `apps/web/src/views/guide/guide.view.tsx`
- Modify: `apps/web/src/views/support-centers/support-centers.view.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Produces: feature namespaces and a dealer-filter hook whose state uses stable IDs rather than translated labels.

- [ ] Move dealer records and filter structure outside the render function.
- [ ] Extract dealer filtering and derived selection behavior into `useDealerFilters`.
- [ ] Translate remaining route content and accessibility labels.
- [ ] Replace arbitrary typography and raw color utilities.
- [ ] Run source tests, focused ESLint, and Web typecheck.

### Task 7: Final Verification

**Files:**

- Verify: `apps/web/tests/source-policy.test.mjs`
- Verify: `apps/web/tests/shared-header.test.mjs`

**Interfaces:**

- Produces: evidence that the migration meets source policy and compiles.

- [ ] Run `node --test apps/web/tests/source-policy.test.mjs` and confirm all assertions pass.
- [ ] Run `pnpm.cmd --filter @repo/web check-types` and confirm exit code 0.
- [ ] Run focused ESLint for every modified TS/TSX/test file and confirm exit code 0.
- [ ] Run `git diff --check` and inspect `git diff --stat` plus `git status --short` for unrelated changes.
