# Corporate About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Corporate Brand & Network About Page (`/about`) for FUJITEK Vietnam, replacing technical 3D layers with 7 corporate sections (Hero Corporate, Milestones Timeline, Vision & Values, Craftsmanship, Dealer Network, Testimonials, B2B CTA).

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
│   ├── about.types.ts                              # Types for corporate stats, milestones, testimonials
│   ├── about.constants.ts                          # Timeline data, pillars, stats, testimonials
│   ├── about.metadata.ts                           # SEO metadata generator
│   ├── about.view.tsx                              # Main Corporate About page view assembly
│   └── components/                                 # Modular component architecture
│       ├── about-hero-corporate.tsx                # Corporate hero banner & metrics
│       ├── about-timeline.tsx                      # Milestones chronological timeline
│       ├── about-vision-values.tsx                 # 3 Core pillars & vision cards
│       ├── about-craftsmanship.tsx                 # Cleanroom standards & certified technicians
│       ├── about-network-banner.tsx                # Dealer network map & E-Warranty commitment
│       ├── about-testimonials.tsx                  # Partner dealers & customer feedback grid
│       └── about-b2b-cta.tsx                       # Partner application & contact CTA section
├── src/messages/
│   ├── vi.json                                     # Vietnamese translations (AboutPage schema)
│   └── en.json                                     # English translations (AboutPage schema)
└── tests/
    ├── about-i18n.test.mjs                         # Guardrail for zero hardcoded copy & schema match
    └── source-policy.test.mjs                      # Route thinness and design token guardrail
```

---

## Task Decomposition

### Task 1: Update Types and Constants for Corporate Features

**Files:**

- Modify: `apps/web/src/views/about/about.types.ts`
- Modify: `apps/web/src/views/about/about.constants.ts`
- Test: `apps/web/tests/about-i18n.test.mjs`

**Interfaces:**

- Consumes: Corporate data structures
- Produces: `MilestoneItem`, `CorePillarItem`, `TestimonialItem` types and updated constants

- [ ] **Step 1: Update `about.types.ts` with corporate interfaces**

```typescript
export interface MilestoneItem {
  id: string;
  year: string;
}

export interface CorePillarItem {
  id: string;
  iconName: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}
```

- [ ] **Step 2: Update `about.constants.ts` with corporate data arrays**

```typescript
import type {
  MilestoneItem,
  CorePillarItem,
  TestimonialItem,
} from "./about.types";

export const aboutMilestones: readonly MilestoneItem[] = [
  { id: "rdJapan", year: "2015" },
  { id: "launchVietnam", year: "2018" },
  { id: "ewarrantyRelease", year: "2021" },
  { id: "networkExpansion", year: "2024" },
] as const;

export const aboutCorePillars: readonly CorePillarItem[] = [
  { id: "pioneerTech", iconName: "Cpu" },
  { id: "japaneseQuality", iconName: "ShieldCheck" },
  { id: "dedicatedService", iconName: "HeartHandshake" },
] as const;

export const aboutTestimonials: readonly TestimonialItem[] = [
  {
    id: "dealerHanoi",
    author: "Anh Trần Đức Thành",
    role: "Giám đốc Panda Auto Showroom Hà Nội",
    avatar: "/guest/guest_2.jpg",
    rating: 5,
  },
  {
    id: "dealerSaigon",
    author: "Anh Nguyễn Quốc Huy",
    role: "Chủ Trung tâm Auto Care Sài Gòn",
    avatar: "/guest/guest_3.jpg",
    rating: 5,
  },
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/about.types.ts apps/web/src/views/about/about.constants.ts
git commit -m "feat(web/about): update corporate types and constants"
```

---

### Task 2: Synchronize Corporate i18n Schemas (`vi.json` & `en.json`)

**Files:**

- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/about-i18n.test.mjs`

**Interfaces:**

- Consumes: `AboutPage` translation schema
- Produces: Complete corporate keys across `vi.json` and `en.json`

- [ ] **Step 1: Update `AboutPage` in `vi.json`**

Add `corporateHero`, `milestones`, `pillars`, `craftsmanship`, `network`, `testimonials`, `b2bCta` keys to `AboutPage` in `vi.json`.

- [ ] **Step 2: Mirror exact keys to `en.json`**

Add matching English translation strings to `AboutPage` in `en.json`.

- [ ] **Step 3: Run i18n test to verify schema equality**

Run: `node --test apps/web/tests/about-i18n.test.mjs`
Expected: PASS (`about message schemas stay identical for vi and en`)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/messages/vi.json apps/web/src/messages/en.json
git commit -m "feat(web/i18n): update corporate translations for vi and en"
```

---

### Task 3: Build Corporate Subcomponents

**Files:**

- Create: `apps/web/src/views/about/components/about-hero-corporate.tsx`
- Create: `apps/web/src/views/about/components/about-timeline.tsx`
- Create: `apps/web/src/views/about/components/about-vision-values.tsx`
- Create: `apps/web/src/views/about/components/about-craftsmanship.tsx`
- Create: `apps/web/src/views/about/components/about-network-banner.tsx`
- Create: `apps/web/src/views/about/components/about-testimonials.tsx`
- Create: `apps/web/src/views/about/components/about-b2b-cta.tsx`

- [ ] **Step 1: Build `AboutHeroCorporate`**
- [ ] **Step 2: Build `AboutTimeline`**
- [ ] **Step 3: Build `AboutVisionValues`**
- [ ] **Step 4: Build `AboutCraftsmanship`**
- [ ] **Step 5: Build `AboutNetworkBanner`**
- [ ] **Step 6: Build `AboutTestimonials`**
- [ ] **Step 7: Build `AboutB2BCta`**

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/views/about/components/
git commit -m "feat(web/about): create corporate subcomponents"
```

---

### Task 4: Assemble Corporate `AboutView` and Validate

**Files:**

- Modify: `apps/web/src/views/about/about.view.tsx`
- Test: `apps/web/tests/about-i18n.test.mjs`

- [ ] **Step 1: Assemble corporate sections in `about.view.tsx`**
- [ ] **Step 2: Run guardrail test**

Run: `node --test apps/web/tests/about-i18n.test.mjs`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/views/about/about.view.tsx
git commit -m "refactor(web/about): assemble corporate AboutView"
```

---

## Execution Choice Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-27-corporate-about-page.md`. Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?
