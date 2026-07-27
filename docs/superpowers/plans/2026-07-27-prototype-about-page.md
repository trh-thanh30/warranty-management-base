# Prototype-Inspired About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/about` with UI/UX & Copy from the Qwen Prototype while adhering strictly to an alternating `bg-white` and `bg-surface-muted` section color theme (zero dark section backgrounds).

**Architecture:** Clean frontend architecture following `docs/architecture/frontend-folder-structure.md`. `app/[locale]/about/page.tsx` remains a thin server component rendering `AboutView`. Types live in `src/views/about/about.types.ts`, constants in `src/views/about/about.constants.ts`, subcomponents in `src/views/about/components/`, and translations in `src/messages/vi.json` and `src/messages/en.json`.

**Tech Stack:** Next.js App Router, React, Tailwind CSS v4, Framer Motion, Lucide React, `next-intl`, Node test runner, TypeScript.

## Global Constraints

- Scope is `apps/web` only; do not touch `apps/admin` or `packages/shared`.
- Do not put `"use client"` in `app/[locale]/about/page.tsx`.
- User-facing copy must live in `apps/web/src/messages/vi.json` and `apps/web/src/messages/en.json`; zero hardcoded text strings or `alt` text in TSX files.
- Typography must strictly use `Saira Condensed` (`font-condensed`) for titles, numbers, and stats, and `Maven Pro` (`font-sans`) for body text and UI controls.
- Design tokens (`premium-red`, `deep-black`, `stone-gray`, `border-gray`, `surface-muted`, `light-gray`) must be respected.
- Strictly alternate section backgrounds (`bg-surface-muted` <-> `bg-white`). Do NOT use deep black (`bg-deep-black`) section backgrounds.
- Every task MUST end with an independently testable deliverable.

---

## File Structure & Component Sequence

```
apps/web/
├── app/[locale]/about/page.tsx                     # Thin server page importing AboutView
├── src/views/about/
│   ├── about.types.ts                              # Updated prototype stats & pillar types
│   ├── about.constants.ts                          # Updated stats (200+ dealers, 63 provinces) & pillars
│   ├── about.metadata.ts                           # SEO metadata generator
│   ├── about.view.tsx                              # Main About page view assembling 10 alternating sections
│   └── components/                                 # Modular component architecture
│       ├── about-hero-corporate.tsx                # Hero banner with 3 border-left stat cards
│       ├── about-timeline.tsx                      # Centered vertical line timeline (2015, 2018, 2021, 2024)
│       ├── about-product-ecosystem.tsx             # 4 Core products (Film, Lighting, Dashcam, TPMS)
│       ├── about-film-layers.tsx                   # 3D 5-layer interactive film stack
│       ├── about-core-tech.tsx                     # Tabbed Sputtering & Nano Ceramic technology
│       ├── about-vision-values.tsx                 # 3 Core pillars with feature checkmark lists
│       ├── about-craftsmanship.tsx                 # Class 1000 cleanroom & ISO 9001 4-cell stat grid
│       ├── about-network-banner.tsx                # Light theme dealer network & E-Warranty lookup
│       ├── about-testimonials.tsx                  # Showroom partner & customer reviews
│       └── about-b2b-cta.tsx                       # Red gradient container with 4 dealer benefit badges
├── src/messages/
│   ├── vi.json                                     # Vietnamese translations (AboutPage schema)
│   └── en.json                                     # English translations (AboutPage schema)
└── tests/
    └── about-i18n.test.mjs                         # Guardrail for zero hardcoded copy & schema match
```

---

## Task Decomposition

### Task 1: Update Types and Constants with Prototype Metrics & Pillars

**Files:**

- Modify: `apps/web/src/views/about/about.types.ts`
- Modify: `apps/web/src/views/about/about.constants.ts`
- Test: `apps/web/tests/about-i18n.test.mjs`

- [ ] **Step 1: Update `about.types.ts` with prototype stats & pillars**

```typescript
export interface PrototypeHeroStat {
  id: string;
  value: string;
}

export interface PrototypePillarItem {
  id: string;
  iconName: string;
  checkKeys: readonly string[];
}

export interface PrototypeB2BBenefitItem {
  id: string;
  iconName: string;
}
```

- [ ] **Step 2: Update `about.constants.ts` with prototype data**

```typescript
export const aboutHeroStats = [
  { id: "uvIr", value: "99%" },
  { id: "origin", value: "100%" },
  { id: "warranty", value: "10 NĂM" },
] as const;

export const aboutNetworkStats = [
  { id: "dealers", value: "200+" },
  { id: "provinces", value: "63" },
  { id: "warrantyYears", value: "10 NĂM" },
  { id: "support", value: "24/7" },
] as const;

export const aboutCraftsmanshipStats = [
  { id: "qaQc", value: "100%" },
  { id: "cleanroom", value: "Class 1000" },
  { id: "iso", value: "ISO 9001" },
  { id: "experience", value: "10+" },
] as const;

export const aboutB2BBenefits = [
  { id: "margin", iconName: "CheckCircle" },
  { id: "training", iconName: "CheckCircle" },
  { id: "marketing", iconName: "CheckCircle" },
  { id: "warranty", iconName: "CheckCircle" },
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/about.types.ts apps/web/src/views/about/about.constants.ts
git commit -m "feat(web/about): update prototype types and constants"
```

---

### Task 2: Synchronize i18n Translation Schemas (`vi.json` & `en.json`)

**Files:**

- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/about-i18n.test.mjs`

- [ ] **Step 1: Update `AboutPage` in `vi.json` with prototype copy**
- [ ] **Step 2: Mirror exact keys to `en.json`**
- [ ] **Step 3: Run i18n guardrail test**

Run: `node --test apps/web/tests/about-i18n.test.mjs`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/messages/vi.json apps/web/src/messages/en.json
git commit -m "feat(web/i18n): update AboutPage schema for prototype components"
```

---

### Task 3: Upgrade Subcomponents (`Hero`, `Timeline`, `VisionValues`, `Craftsmanship`, `Network`, `B2BCta`)

**Files:**

- Modify: `apps/web/src/views/about/components/about-hero-corporate.tsx`
- Modify: `apps/web/src/views/about/components/about-timeline.tsx`
- Modify: `apps/web/src/views/about/components/about-vision-values.tsx`
- Modify: `apps/web/src/views/about/components/about-craftsmanship.tsx`
- Modify: `apps/web/src/views/about/components/about-network-banner.tsx`
- Modify: `apps/web/src/views/about/components/about-b2b-cta.tsx`

- [ ] **Step 1: Upgrade `AboutHeroCorporate` with 3 border-left stat cards and rotated glassmorphism card**
- [ ] **Step 2: Upgrade `AboutTimeline` with centered vertical line and 2015-2024 badge pills**
- [ ] **Step 3: Upgrade `AboutVisionValues` with 3 pillar cards featuring red checkmark lists**
- [ ] **Step 4: Upgrade `AboutCraftsmanship` with 4-cell stat grid (100% QA/QC, Class 1000, ISO 9001, 10+ Years)**
- [ ] **Step 5: Upgrade `AboutNetworkBanner` with light-themed 200+ Dealers, 63 Provinces section**
- [ ] **Step 6: Upgrade `AboutB2BCta` with red gradient box and 4 benefit badges**
- [ ] **Step 7: Commit**

```bash
git add apps/web/src/views/about/components/
git commit -m "feat(web/about): upgrade subcomponents with prototype UI/UX"
```

---

### Task 4: Assemble Alternating `AboutView` and Validate

**Files:**

- Modify: `apps/web/src/views/about/about.view.tsx`
- Test: `apps/web/tests/about-i18n.test.mjs`

- [ ] **Step 1: Assemble all 10 alternating sections in `about.view.tsx`**
- [ ] **Step 2: Run guardrail test**

Run: `node --test apps/web/tests/about-i18n.test.mjs`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/about.view.tsx
git commit -m "refactor(web/about): assemble prototype-inspired alternating AboutView"
```

---

## Execution Choice Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-27-prototype-about-page.md`. Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?
