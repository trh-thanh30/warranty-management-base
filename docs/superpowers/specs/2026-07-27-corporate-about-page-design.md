# Corporate About Page Redesign Specification

> **Date:** 2026-07-27
> **Topic:** Repurpose `/about` into a Corporate Brand & Network Page (Trang Giới Thiệu Doanh Nghiệp & Mạng Lưới)

---

## 1. Goal & Product Intent

Repurpose the main `/about` page of `apps/web` from an ultra-technical 3D layer showcase into a **Corporate Brand & Network About Page**. The new page targets both B2C car owners seeking brand credibility and B2B partners/dealers interested in joining the FUJITEK authorized network in Vietnam.

---

## 2. Architecture & File Structure

Following `docs/architecture/frontend-folder-structure.md`:

```
apps/web/
├── app/[locale]/about/page.tsx                     # Thin server page importing AboutView
├── src/views/about/
│   ├── about.types.ts                              # View state & component prop interfaces
│   ├── about.constants.ts                          # Milestones, stats, core pillars, testimonial data
│   ├── about.metadata.ts                           # SEO metadata generator
│   ├── about.view.tsx                              # Main About page view assembly
│   └── components/                                 # Modular component architecture
│       ├── about-hero-corporate.tsx                # Corporate hero banner & key metrics
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

## 3. Section Breakdown & UI Components

### 3.1 `AboutHeroCorporate`

- **Purpose**: Establish FUJITEK Vietnam's market position as the leading Japanese automotive window film distributor.
- **Visuals**: Premium showroom background, gradient overlay, stat counter cards (10+ Years Experience, 100+ Authorized Dealers, 50,000+ Cars Installed, 100% Japanese Tech).
- **Typography**: `Saira Condensed` (`font-condensed`) for titles & stats, `Maven Pro` (`font-sans`) for descriptions & badges.

### 3.2 `AboutTimeline`

- **Purpose**: Showcase history, R&D origins in Japan, and growth milestones in Vietnam.
- **Data**: Array of timeline items (`researchJapan`, `launchVietnam`, `ewarrantyRelease`, `networkExpansion`) in `about.constants.ts`.

### 3.3 `AboutVisionValues`

- **Purpose**: Communicate corporate mission, vision, and core values.
- **Pillars**:
  1. _Công Nghệ Tiên Phong (Pioneer Technology)_: Dual-core Sputtering & Nano Ceramic innovation.
  2. _Chất Lượng Nhật Bản (Japanese Quality)_: ISO 9001 cleanroom manufacturing.
  3. _Tận Tâm Đồng Hành (Committed Service)_: 10-15 year E-Warranty protection.

### 3.4 `AboutCraftsmanship`

- **Purpose**: Highlight professional installation standards and certified technicians.
- **Content**: Cleanroom dust control standards (Class 1000), trained & certified installers, 100% QA/QC inspection before vehicle handoff.

### 3.5 `AboutNetworkBanner`

- **Purpose**: Highlight national presence and authorized dealer network.
- **Content**: Interactive map illustration, E-Warranty electronic lookup system integration preview, link to `/dealers`.

### 3.6 `AboutTestimonials`

- **Purpose**: Social proof from B2B dealer partners and luxury car owners.
- **Data**: Testimonial items in `about.constants.ts`.

### 3.7 `AboutB2BCta`

- **Purpose**: Convert interested dealers and customers.
- **Action**: Primary CTA button linking to `/dealers` (Đăng ký đại lý) and secondary button linking to `/contact` (Liên hệ tư vấn).

---

## 4. Typography & Design Tokens

- **Titles / Section Numbers / Stats**: `--font-condensed` (`Saira Condensed`), `uppercase`, `tracking-tight` or `tracking-wider`.
- **Body Text / UI Badges**: `--font-sans` (`Maven Pro`), `font-normal` or `font-medium`, `text-stone-gray` / `text-deep-black`.
- **Colors**: Strictly primitive and semantic tokens (`premium-red`, `warm-red`, `deep-black`, `stone-gray`, `surface-muted`, `border-gray`).

---

## 5. i18n & Accessibility

- Complete translation key hierarchy in `AboutPage` namespace for `vi.json` and `en.json`.
- Zero hardcoded Vietnamese text or `alt` text in TSX files.
- `prefers-reduced-motion` compliance for Framer Motion scroll reveals.

---

## 6. Verification Plan

1. **Automated i18n & Guardrail Tests**:
   - Run `node --test apps/web/tests/about-i18n.test.mjs`
   - Run `node --test apps/web/tests/source-policy.test.mjs`
2. **Build Validation**:
   - Run `pnpm --filter web build` to verify clean static page generation.
3. **Manual Responsive Check**:
   - Validate layouts on Mobile (<640px), Tablet (768px - 1024px), and Desktop (>1280px).
