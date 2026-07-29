# Hybrid About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Hybrid About Page (`/about`) for FUJITEK - LEXZENZ Vietnam, integrating corporate brand credibility, 4 core product categories (Lexzenz Reflex Korea Film, Lexzenz Led Fujitek, Lexzenz Dashcam, TPMS Lexzenz), 3D 5-layer film stack, tabbed Sputtering/Nano Ceramic technology, cleanroom craftsmanship, and nationwide dealer network.

**Architecture:** Clean frontend architecture following `docs/architecture/frontend-folder-structure.md`. `app/[locale]/about/page.tsx` remains a thin server component rendering `AboutView`. Types live in `src/views/about/about.types.ts`, constants in `src/views/about/about.constants.ts`, subcomponents in `src/views/about/components/`, and translations in `src/messages/vi.json` and `src/messages/en.json`.

**Tech Stack:** Next.js App Router, React, Tailwind CSS v4, Framer Motion, Lucide React, `next-intl`, Node test runner, TypeScript.

## Global Constraints

- Scope is `apps/web` only; do not touch `apps/admin` or `packages/shared`.
- Do not put `"use client"` in `app/[locale]/about/page.tsx`.
- User-facing copy must live in `apps/web/src/messages/vi.json` and `apps/web/src/messages/en.json`; zero hardcoded text strings or `alt` text in TSX files.
- Typography must strictly use `Saira Condensed` (`font-condensed`) for titles, numbers, and stats, and `Maven Pro` (`font-sans`) for body text and UI controls.
- Design tokens (`premium-red`, `deep-black`, `stone-gray`, `border-gray`, `surface-muted`, `light-gray`) must be respected.
- Every task MUST end with an independently testable deliverable.

---

## File Structure & Responsibility Map

```
apps/web/
├── app/[locale]/about/page.tsx                     # Thin server page importing AboutView
├── src/views/about/
│   ├── about.types.ts                              # Ecosystem products, film layers & milestone interfaces
│   ├── about.constants.ts                          # 4 Ecosystem products, 5 film layers, stats, milestones
│   ├── about.metadata.ts                           # SEO metadata generator
│   ├── about.view.tsx                              # Main Hybrid About page view assembly
│   └── components/                                 # Modular component architecture
│       ├── about-hero-corporate.tsx                # Corporate hero banner & metrics
│       ├── about-timeline.tsx                      # Milestones chronological timeline
│       ├── about-product-ecosystem.tsx             # [NEW] 4 Core product lines (Film, Lighting, Dashcam, TPMS)
│       ├── about-film-layers.tsx                   # 3D 5-layer film stack interactive component
│       ├── about-core-tech.tsx                     # Tabbed Sputtering vs Nano Ceramic technology
│       ├── about-craftsmanship.tsx                 # Cleanroom standards & certified technicians
│       ├── about-network-banner.tsx                # Dealer network map & E-Warranty commitment
│       ├── about-testimonials.tsx                  # Partner dealers & customer feedback grid
│       └── about-b2b-cta.tsx                       # Partner application & contact CTA section
├── src/messages/
│   ├── vi.json                                     # Vietnamese translations (AboutPage schema)
│   └── en.json                                     # English translations (AboutPage schema)
└── tests/
    └── about-i18n.test.mjs                         # Guardrail for zero hardcoded copy & schema match
```

---

## Task Decomposition

### Task 1: Update Types and Constants with Ecosystem Products & Film Layers

**Files:**

- Modify: `apps/web/src/views/about/about.types.ts`
- Modify: `apps/web/src/views/about/about.constants.ts`
- Test: `apps/web/tests/about-i18n.test.mjs`

**Interfaces:**

- Consumes: `EcosystemProductItem`, `FilmLayerDetail`, `MilestoneItem`
- Produces: Updated `about.constants.ts` with 4 core products and 5 film layers

- [ ] **Step 1: Update `about.types.ts`**

```typescript
export interface EcosystemProductItem {
  id: string;
  badge: string;
  image: string;
  iconName: string;
}

export interface FilmLayerDetail {
  id: string;
  color: string;
  zOffset: number;
}

export interface MilestoneItem {
  id: string;
  year: string;
}

export interface CorporateStatItem {
  id: string;
  value: string;
  target: number;
  suffix: string;
}
```

- [ ] **Step 2: Update `about.constants.ts`**

```typescript
import type {
  EcosystemProductItem,
  FilmLayerDetail,
  MilestoneItem,
  CorporateStatItem,
} from "./about.types";

export const aboutEcosystemProducts: readonly EcosystemProductItem[] = [
  {
    id: "film",
    badge: "Multilayer Sputter & Nano",
    image: "/feat1.jpg",
    iconName: "Shield",
  },
  {
    id: "lighting",
    badge: "Bi LED & LED Gầm",
    image: "/feat2.jpg",
    iconName: "Zap",
  },
  {
    id: "dashcam",
    badge: "Ghi Hình 4K",
    image: "/guest/guest_2.jpg",
    iconName: "Camera",
  },
  {
    id: "tpms",
    badge: "Đo Áp Suất Realtime",
    image: "/guest/guest_3.jpg",
    iconName: "Gauge",
  },
] as const;

export const aboutFilmLayerDetails: readonly FilmLayerDetail[] = [
  { id: "scratchCoat", color: "var(--color-slate-blue)", zOffset: 120 },
  { id: "sputterMetal", color: "var(--color-danger-red)", zOffset: 80 },
  { id: "opticalBase", color: "var(--color-silver-fog)", zOffset: 40 },
  { id: "nanoCeramic", color: "var(--color-premium-red)", zOffset: 0 },
  { id: "adhesive", color: "var(--color-dark-charcoal)", zOffset: -40 },
] as const;

export const aboutFilmLayerIds = [
  "scratchCoat",
  "sputterMetal",
  "opticalBase",
  "nanoCeramic",
  "adhesive",
] as const;

export const aboutCorporateStats: readonly CorporateStatItem[] = [
  { id: "years", value: "10+", target: 10, suffix: "+" },
  { id: "dealers", value: "100+", target: 100, suffix: "+" },
  { id: "installed", value: "50K+", target: 50, suffix: "K+" },
  { id: "iso", value: "100%", target: 100, suffix: "%" },
] as const;

export const aboutMilestones: readonly MilestoneItem[] = [
  { id: "rdJapan", year: "2015" },
  { id: "launchVietnam", year: "2018" },
  { id: "ewarrantyRelease", year: "2021" },
  { id: "networkExpansion", year: "2024" },
] as const;

export const aboutCraftsmanshipSpecs = [
  "cleanroom",
  "technicians",
  "inspection",
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/about.types.ts apps/web/src/views/about/about.constants.ts
git commit -m "feat(web/about): update types and constants with ecosystem products and film layers"
```

---

### Task 2: Synchronize i18n Translation Schemas (`vi.json` & `en.json`)

**Files:**

- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/about-i18n.test.mjs`

- [ ] **Step 1: Add `ecosystem`, `filmLayers`, `coreTech` to `AboutPage` in `vi.json`**
- [ ] **Step 2: Mirror exact keys to `en.json`**
- [ ] **Step 3: Run i18n test check**

Run: `node --test apps/web/tests/about-i18n.test.mjs`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/messages/vi.json apps/web/src/messages/en.json
git commit -m "feat(web/i18n): update AboutPage translation schemas for hybrid sections"
```

---

### Task 3: Build `AboutProductEcosystem` Component

**Files:**

- Create: `apps/web/src/views/about/components/about-product-ecosystem.tsx`

- [ ] **Step 1: Write `about-product-ecosystem.tsx` showcasing the 4 core product categories**
- [ ] **Step 2: Commit**

```bash
git add apps/web/src/views/about/components/about-product-ecosystem.tsx
git commit -m "feat(web/about): create AboutProductEcosystem subcomponent"
```

---

### Task 4: Re-integrate `AboutFilmLayers` and `AboutCoreTech` Subcomponents

**Files:**

- Modify/Create: `apps/web/src/views/about/components/about-film-layers.tsx`
- Modify/Create: `apps/web/src/views/about/components/about-core-tech.tsx`

- [ ] **Step 1: Verify `AboutFilmLayers` 3D layer stack component**
- [ ] **Step 2: Verify `AboutCoreTech` tabbed Sputtering / Nano Ceramic component**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/components/about-film-layers.tsx apps/web/src/views/about/components/about-core-tech.tsx
git commit -m "feat(web/about): integrate AboutFilmLayers and AboutCoreTech subcomponents"
```

---

### Task 5: Assemble Hybrid `AboutView` and Validate

**Files:**

- Modify: `apps/web/src/views/about/about.view.tsx`
- Test: `apps/web/tests/about-i18n.test.mjs`

- [ ] **Step 1: Assemble `about.view.tsx` with all 9 hybrid sections**
- [ ] **Step 2: Run guardrail test**

Run: `node --test apps/web/tests/about-i18n.test.mjs`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/about.view.tsx
git commit -m "refactor(web/about): assemble unified hybrid AboutView"
```

---

## Execution Choice Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-27-hybrid-about-page.md`. Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?
