# Web Design System Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `apps/web` so route/view organization, color usage, font size, font weight, i18n, constants, and hooks follow one consistent frontend system.

**Architecture:** Keep `app/**/page.tsx` thin and route all UI through `src/views`. Define one web design-system contract in `globals.css`, enforce it with source-policy tests, then migrate views by page group instead of changing everything manually in one pass.

**Tech Stack:** Next.js App Router, React, Tailwind CSS v4 token variables, `next-intl`, Node test runner, TypeScript.

## Global Constraints

- Scope is `apps/web` only; `apps/admin/next-env.d.ts` is already dirty and must not be touched unless explicitly requested.
- Do not put `"use client"` in `app/**/page.tsx`.
- User-facing copy must live in `apps/web/src/messages/vi.json` and `apps/web/src/messages/en.json`, not directly in TSX.
- Static feature config stays in `src/views/<feature>/<feature>.constants.ts`; shared config used by multiple features goes to `src/constants`.
- Shared hooks used by more than one feature stay in `src/hooks`; feature-only hooks stay inside the feature folder.
- Avoid hardcoded arbitrary font sizes such as `text-[8px]`, `text-[10px]`, `text-[11px]`.
- Avoid heavy UI: migrate `font-bold`, `font-extrabold`, `font-black` down to `font-medium` or limited `font-semibold`.
- Components should use design tokens from `globals.css`; raw hex and default Tailwind palette colors should be removed except documented exceptions.
- Do not delete public assets or legacy files without verifying no live references remain.

---

## Current Audit Snapshot

- `git diff --stat` currently shows 36 tracked files changed with roughly `2089 insertions` and `5647 deletions`, plus many untracked routes/views/assets.
- New route files exist under:
  - `apps/web/app/[locale]/about`
  - `apps/web/app/[locale]/gioi-thieu`
  - `apps/web/app/[locale]/products`
  - `apps/web/app/[locale]/san-pham`
  - `apps/web/app/[locale]/warranty/**`
  - `apps/web/app/[locale]/policy`
  - Vietnamese policy route aliases.
- Typography hotspots from current source scan:
  - `font-medium`: 182
  - `font-semibold`: 167
  - `font-bold`: 109
  - `font-black`: 46
  - `font-extrabold`: 1
  - `text-[11px]`: 10
  - `text-[10px]`: 4
- Color hotspots from current source scan:
  - `border-gray`: 175
  - `text-stone`: 144
  - `bg-white`: 83
  - `text-white`: 85
  - `bg-yellow-400`: 5
  - several `red-*`, `emerald-*`, `amber-*`, `slate-*`, `black/*`, `white/*` usages.
- Hardcoded copy hotspots:
  - `apps/web/src/views/about/about.view.tsx`
  - `apps/web/src/views/product-detail/product-detail.view.tsx`
  - `apps/web/src/views/policy/*`
  - `apps/web/src/constants/warranty.constants.ts`
  - `apps/web/src/views/dealers/dealers.constants.ts`

## Target Design-System Contract

### Color rules

Use a three-layer token model:

1. Primitive tokens in `globals.css`: raw values only.
2. Semantic tokens in `globals.css`: purpose names used by UI.
3. Component classes/tokens: repeated recipes for buttons, inputs, cards, badges, links.

Allowed component-facing colors:

- Brand/action: `premium-red`, `warm-red`, `muted-red`.
- Text: `deep-black`, `dark-charcoal`, `stone-gray`, `medium-gray`.
- Surface: `off-white`, `surface-muted`, `light-gray`.
- Border/input: `border-gray`, `input-border`.
- Accent: `accent-gold`, `accent-gold-hover`.
- Social only: `facebook-blue`, `zalo-blue`; TikTok/YouTube use their existing brand tokens or inline SVG fill constants only in one shared social component.

Documented exceptions:

- `text-white` and `bg-white` may remain where the semantic meaning is genuinely white surface/text.
- Transparent opacity variants like `text-white/70` may remain only in dark sections if wrapped by shared section style decisions.
- Inline SVG flag/icon colors may remain if they are inside isolated visual components and not used as app theme colors.

### Typography rules

- Body/default copy: no explicit weight, or `font-normal`/`font-medium`.
- Eyebrow/badge labels: `text-xs sm:text-sm font-medium uppercase tracking-wider`.
- Card titles: `text-lg sm:text-xl font-medium` or `font-semibold` only when needed.
- Section titles: `font-condensed text-3xl sm:text-4xl lg:text-5xl font-medium uppercase tracking-wider`.
- Hero titles: max `font-semibold`; no `font-black`/`font-extrabold`.
- Numeric hero/stat emphasis: max `font-semibold`.
- Replace `text-[10px]` and `text-[11px]` with `text-xs`; if too large visually, reduce tracking/padding instead of arbitrary font size.

## File Responsibility Map

- Modify: `apps/web/app/globals.css`
  - Own token definitions and repeated utility recipes.
- Modify: `apps/web/tests/source-policy.test.mjs`
  - Own guardrails for color, typography, i18n, route thinness, image path integrity.
- Modify: `apps/web/src/messages/vi.json`
  - Vietnamese copy source of truth.
- Modify: `apps/web/src/messages/en.json`
  - English copy source of truth with matching keys.
- Modify: `apps/web/src/components/layout/site-header.tsx`
  - Shared navigation shell only.
- Modify: `apps/web/src/components/warranty-lookup-modal.tsx`
  - Shared warranty lookup modal UI only.
- Modify: `apps/web/src/components/floating-quick-action.tsx`
  - Keep only if used outside home; otherwise mark for deletion after reference scan.
- Modify: `apps/web/src/views/home/**`
  - Home sections and feature-local constants.
- Modify: `apps/web/src/views/about/**`
  - About route UI, constants, i18n migration.
- Modify: `apps/web/src/views/products/**`
  - Catalog category UI, constants, filtering hooks.
- Modify: `apps/web/src/views/product-detail/**`
  - Product detail content, specs/pricing constants, i18n migration.
- Modify: `apps/web/src/views/warranty/**`
  - Warranty hub/lookup/activate/request/track forms and state.
- Modify: `apps/web/src/views/contact/**`
  - Contact form and social/contact metadata.
- Modify: `apps/web/src/views/policy/**`
  - Policy content, layout, route aliases.
- Modify: `apps/web/src/views/dealers/**`
  - Dealer data classification: business data constants can stay, display labels move to i18n.
- Modify: `apps/web/src/views/guide/**`
  - Guide content and route UI.
- Modify: `apps/web/src/views/support-centers/**`
  - Support-center page UI and copy.

## Task 1: Baseline and Policy Gates

**Files:**

- Modify: `apps/web/tests/source-policy.test.mjs`

**Interfaces:**

- Consumes: current `apps/web` source tree.
- Produces: enforceable source-policy tests for all later tasks.

- [ ] Run `git status --short` and save the output in the task notes.
- [ ] Run `git diff --stat` and save the output in the task notes.
- [ ] Add or tighten source-policy tests to fail on:
  - `font-bold`, `font-extrabold`, `font-black`.
  - `text-[<number>px]` and `text-[<number>rem]`.
  - raw hex in TSX except isolated SVG/flag visual exceptions.
  - default Tailwind palette colors in TSX outside the documented allowlist.
  - Vietnamese hardcoded text in `*.tsx` and `*.ts`, excluding business data constants explicitly documented as data.
  - `"use client"` in `app/**/page.tsx`.
- [ ] Run `node --test apps\web\tests\source-policy.test.mjs`.
- [ ] Keep the failures as the migration checklist for Tasks 2-8.

## Task 2: Normalize `globals.css` Tokens

**Files:**

- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/tests/source-policy.test.mjs`

**Interfaces:**

- Consumes: color/font rules in this plan.
- Produces: a stable token contract used by all views.

- [ ] Group CSS variables into `PRIMITIVE`, `SEMANTIC`, and `COMPONENT` sections.
- [ ] Keep existing brand-compatible token names used by current components, but remove duplicate/contradictory aliases where possible.
- [ ] Confirm `--color-deep-black` means brand near-black text and document that it is not a Tailwind default.
- [ ] Add component-level class recipes if they reduce repetition:
  - `.btn-primary`
  - `.btn-secondary`
  - `.badge-brand`
  - `.form-control`
  - `.card-surface`
- [ ] Keep body default weight at `400`.
- [ ] Keep synthetic bold disabled if already configured.
- [ ] Do not globally remap `font-semibold`, `font-bold`, `font-extrabold`, `font-black` to hide component misuse. The source must be refactored instead.
- [ ] Run `node --test apps\web\tests\source-policy.test.mjs` and confirm remaining failures are source migrations, not missing token definitions.

## Task 3: Shared Component Style Pass

**Files:**

- Modify: `apps/web/src/components/layout/site-header.tsx`
- Modify: `apps/web/src/components/warranty-lookup-modal.tsx`
- Modify: `apps/web/src/components/floating-quick-action.tsx`
- Modify: `apps/web/src/constants/warranty.constants.ts`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: tokens from Task 2.
- Produces: shared navigation/modal/action components that set the visual baseline.

- [ ] Convert repeated button/input/badge classes to the new token recipes or allowed token utilities.
- [ ] Replace heavy weights with `font-medium` or limited `font-semibold`.
- [ ] Move any remaining user-facing text from `warranty.constants.ts` to messages when it is label/copy rather than mock data.
- [ ] Verify header active state still works for Vietnamese and English route aliases.
- [ ] Verify warranty modal input focus uses red active border and no double-border/shadow artifact.
- [ ] Run `node --test apps\web\tests\source-policy.test.mjs`.

## Task 4: Home View Style and Data Organization

**Files:**

- Modify: `apps/web/src/views/home/home.view.tsx`
- Modify: `apps/web/src/views/home/home.constants.ts`
- Modify: `apps/web/src/views/home/components/*.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: shared token recipes and existing `useSlider`.
- Produces: home sections with consistent typography/color and gallery/project data kept in constants.

- [ ] Ensure `home.view.tsx` only composes sections.
- [ ] Keep home-only arrays in `home.constants.ts`; split into focused constants files only if the file becomes difficult to maintain.
- [ ] Replace all home `font-semibold` with `font-medium` unless the text is a section title, card title, or primary CTA.
- [ ] Remove raw palette usages like `text-red-*`, `text-emerald-*`, `bg-yellow-*`; map to semantic tokens.
- [ ] Keep gallery images from `public/sanpham` and `public/khachhang` inside the existing `GallerySection`.
- [ ] Keep `GallerySection` pagination/slider behavior through `useSlider`, not local duplicated slider logic.
- [ ] Run source-policy tests, lint, and typecheck for web.

## Task 5: About Page Decomposition and i18n Migration

**Files:**

- Modify: `apps/web/src/views/about/about.view.tsx`
- Create if needed: `apps/web/src/views/about/about.constants.ts`
- Create if needed: `apps/web/src/views/about/about.types.ts`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: `next-intl` messages and token recipes.
- Produces: about route with no Vietnamese hardcoded UI copy and no heavy typography.

- [ ] Move `filmLayers`, tab labels, stat labels, section headings, CTA labels, and descriptive paragraphs out of TSX.
- [ ] Keep visual-only values such as numeric rotation offsets, transform depths, and layer positions in constants.
- [ ] Replace `font-black` and `font-extrabold` with `font-medium`/`font-semibold`.
- [ ] Replace `text-[11px]` with `text-xs`.
- [ ] Replace inline/raw gradients using raw hex with token-based CSS classes or CSS variables.
- [ ] Keep interactive state in `about.view.tsx` only if it composes the whole page; extract child components if the file remains too large after i18n migration.
- [ ] Run source-policy tests.

## Task 6: Product Listing and Product Detail Refactor

**Files:**

- Modify: `apps/web/src/views/products/products.view.tsx`
- Modify: `apps/web/src/views/products/products.constants.ts`
- Modify: `apps/web/src/views/products/products.types.ts`
- Modify: `apps/web/src/views/product-detail/product-detail.view.tsx`
- Create if needed: `apps/web/src/views/product-detail/product-detail.constants.ts`
- Create if needed: `apps/web/src/views/product-detail/product-detail.types.ts`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: product category model and route aliases.
- Produces: product pages that support multiple categories, not one hardcoded decal/product narrative.

- [ ] Define category model explicitly: `all`, `windowFilm`, plus future categories if already present in product data.
- [ ] Move filter options, sort options, product badges, spec labels, pricing labels, CTA labels, and long descriptions to constants/messages.
- [ ] Keep numeric specs/prices as data constants, not message strings, when they are business data.
- [ ] Remove hardcoded Vietnamese from product detail TSX.
- [ ] Replace all `font-bold` and `font-black` in product detail with the typography rules.
- [ ] Replace `text-[11px]` with `text-xs`.
- [ ] Replace `bg-accent-gold hover:bg-yellow-400` with `bg-accent-gold hover:bg-accent-gold-hover`.
- [ ] Run source-policy tests, lint, and typecheck.

## Task 7: Warranty, Contact, Dealers, Guide, Support Centers

**Files:**

- Modify: `apps/web/src/views/warranty/**`
- Modify: `apps/web/src/views/contact/**`
- Modify: `apps/web/src/views/dealers/**`
- Modify: `apps/web/src/views/guide/**`
- Modify: `apps/web/src/views/support-centers/**`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: shared form/button/card style recipes.
- Produces: consistent forms/cards/icons across service pages.

- [ ] Standardize form controls to one focus style: red active border/ring.
- [ ] Standardize primary submit buttons to brand red, not black or ad-hoc yellow.
- [ ] Keep yellow only as accent badge where content semantics require it.
- [ ] Move form labels, placeholders, helper text, badges, CTA labels, empty/success messages to i18n.
- [ ] Keep dealer names, phone numbers, coordinates, and addresses as data constants; move display labels like city filter labels to i18n.
- [ ] Remove unnecessary `"use client"` from view files that do not use state/effects/browser APIs.
- [ ] Run source-policy tests.

## Task 8: Policy Pages Consolidation

**Files:**

- Modify: `apps/web/src/views/policy/components/policy-layout.tsx`
- Modify: `apps/web/src/views/policy/policy-detail.view.tsx`
- Modify: `apps/web/src/views/policy/*.view.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`

**Interfaces:**

- Consumes: route-level policy content and token recipes.
- Produces: policy pages with reusable layout and message-backed content.

- [ ] Choose one policy rendering path: either `policy-layout.tsx` with page-specific data, or `policy-detail.view.tsx` with a content map.
- [ ] Remove duplicated policy contact card markup.
- [ ] Move policy titles, leads, headings, paragraphs, bullets, breadcrumbs, and contact labels to messages.
- [ ] Keep company addresses/phone numbers in constants if they are data reused elsewhere.
- [ ] Replace `font-bold`, `text-[11px]`, `hover:bg-yellow-400`, and palette colors.
- [ ] Run source-policy tests.

## Task 9: Route Thinness and Dead Code/Asset Review

**Files:**

- Modify: `apps/web/app/[locale]/**/page.tsx`
- Delete only after verification: unused `apps/web/src/components/floating-quick-action.tsx`
- Delete only after verification: unused legacy public images already marked deleted in git.

**Interfaces:**

- Consumes: final route/view structure.
- Produces: clean App Router boundary and safe asset cleanup.

- [ ] Verify every `app/[locale]/**/page.tsx` imports and renders one view only.
- [ ] Verify no `page.tsx` has `"use client"`.
- [ ] Run `rg -n "FloatingQuickAction|service_1|service_2|service_3|service_4|supercar_2|supercar_hero|workshop_1|workshop_2|workshop_3" apps\web`.
- [ ] Delete only files with zero live references and no planned usage.
- [ ] If public assets are deleted, report exactly what was removed.
- [ ] Run source-policy tests.

## Task 10: Final Verification

**Files:**

- No implementation files unless Task 10 exposes a specific failure.

**Interfaces:**

- Consumes: all prior tasks.
- Produces: verified refactor ready for review.

- [ ] Run `node --test apps\web\tests\source-policy.test.mjs`.
- [ ] Run `pnpm.cmd --filter @repo/web lint`.
- [ ] Run `pnpm.cmd --filter @repo/web exec tsc --noEmit`.
- [ ] Run `git diff --check`.
- [ ] Run final scans:
  - `rg -n "font-(bold|extrabold|black)|text-\[[0-9.]+(px|rem)\]" apps\web\src apps\web\app`
  - `rg -n "[À-ỹĐđ]" apps\web\src --glob "*.tsx" --glob "*.ts"`
  - `rg -n "bg-yellow|hover:bg-yellow|text-red-[0-9]|bg-red-[0-9]|border-gray|text-stone-[0-9]" apps\web\src apps\web\app`
- [ ] Review `git diff --stat` and provide a summary grouped by:
  - design system
  - shared components
  - home
  - about
  - product/product-detail
  - warranty/contact/dealers
  - policy
  - tests

## Execution Order

1. Task 1 first to turn style inconsistency into failing checks.
2. Task 2 second so every later change has a stable target.
3. Task 3 third because shared components affect every route.
4. Tasks 4-8 by page group, one group at a time.
5. Task 9 only after page groups pass.
6. Task 10 before claiming completion.

## Review Gates

- Gate A after Task 2: confirm token naming is acceptable before mass migration.
- Gate B after Task 4: inspect home page visually before applying same style to all pages.
- Gate C after Task 8: review policy/product copy migration because it changes a lot of i18n keys.
- Gate D after Task 10: final diff review.

## Acceptance Criteria

- No `font-bold`, `font-extrabold`, or `font-black` remains in `apps/web/src` or `apps/web/app`.
- No arbitrary pixel/rem font-size utility remains.
- No Vietnamese UI copy remains hardcoded in TSX/TS except approved business data constants.
- No raw hex or unapproved Tailwind palette color remains in route/view/component TSX.
- `vi.json` and `en.json` have matching message paths.
- All `app/**/page.tsx` files are thin server route files.
- Web lint and TypeScript checks pass.
- Source-policy tests pass and encode the style rules so the issue does not regress.
