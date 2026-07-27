# Prototype-Inspired About Page Design Specification

> **Date:** 2026-07-27
> **Topic:** Upgrade `/about` with UI/UX & Copy from Qwen Prototype while adhering to strictly alternating `bg-white` and `bg-surface-muted` theme.

---

## 1. Directives & Constraints

- **Strict Background Rule**: Do NOT use deep black (`bg-deep-black`) backgrounds for sections. Sections must strictly alternate between `bg-white` and `bg-surface-muted`.
- **Typography**: `font-condensed` (`Saira Condensed`) for titles/stats, `font-sans` (`Maven Pro`) for body & UI labels.
- **Design Tokens**: Respect primitive & semantic design tokens (`premium-red`, `stone-gray`, `border-gray`, `surface-muted`, `light-gray`).
- **i18n Standard**: 100% copy localized in `vi.json` and `en.json`; zero hardcoded text strings.

---

## 2. Section Alternating Flow & Enhancements

```
1. [AboutHeroCorporate]    --> bg-surface-muted  (Hero banner, 3 border-left stats: 99% UV/IR, 100% Japan, 10-Yr Warranty)
2. [AboutTimeline]         --> bg-white          (Centered vertical line timeline: 2015, 2018, 2021, 2024 badges)
3. [AboutProductEcosystem] --> bg-surface-muted  (4 Core products: Film, Lighting, Dashcam, TPMS)
4. [AboutFilmLayers]       --> bg-white          (3D 5-layer interactive film stack)
5. [AboutCoreTech]         --> bg-surface-muted  (Sputtering & Nano Ceramic technology tabs)
6. [AboutVisionValues]     --> bg-white          (3 Core pillars with red checkmark feature lists)
7. [AboutCraftsmanship]    --> bg-surface-muted  (Class 1000 cleanroom, ISO 9001 stat grid & R&D specs)
8. [AboutNetworkBanner]    --> bg-white          (200+ Dealers, 63 Provinces, Light network card & map preview)
9. [AboutTestimonials]     --> bg-surface-muted  (Showroom partner reviews with 5-star ratings)
10. [AboutB2BCta]          --> bg-white          (Red gradient container with 4 dealer benefit badges: Margin, Training, Marketing, 10-Yr Warranty)
```

---

## 3. Detailed Component Spec

### 3.1 `AboutHeroCorporate` (`bg-surface-muted`)

- Eyebrow pill: `gradient-red` background with `Award` icon.
- Headline: "GIẢI PHÁP BẢO VỆ ĐỈNH CAO CHO XE Ô TÔ".
- Stat bar: 3 vertical border-left stats (`99% Cản UV/IR`, `100% Xuất xứ Nhật Bản`, `10 Năm Bảo hành`).
- Right card: Rotated glassmorphism card with ISO 9001 badge and icon list.

### 3.2 `AboutTimeline` (`bg-white`)

- Centered vertical line (`timeline-line`).
- Alternating left/right milestone cards around centered year badges (`2015`, `2018`, `2021`, `2024`).

### 3.3 `AboutVisionValues` (`bg-white`)

- 3 Pillar cards: _Công Nghệ Tiên Phong_, _Chất Lượng Nhật Bản_, _Dịch Vụ Tận Tâm_.
- Each card includes a list of 3 feature items with red checkmark icons (`Check`).

### 3.4 `AboutCraftsmanship` (`bg-surface-muted`)

- Left: 3 R&D & manufacturing step cards (`Microscope`, `Factory`, `Clipboard`).
- Right: 4-cell stat grid (`100% QA/QC`, `Class 1000 Cleanroom`, `ISO 9001`, `10+ Years R&D`).

### 3.5 `AboutNetworkBanner` (`bg-white` - No black background!)

- Light background container with subtle red border.
- Stats: `200+ Đại lý`, `63 Tỉnh thành`, `10 Năm E-Warranty`, `24/7 Support`.
- Interactive Map preview card & action buttons to `/dealers` and `/warranty/lookup`.

### 3.6 `AboutB2BCta` (`bg-white`)

- Inner container: `gradient-red` red gradient box with white text.
- 4 benefit badges: _Chiết khấu hấp dẫn_, _Đào tạo chuyên sâu_, _Hỗ trợ marketing_, _Bảo hành 10 năm_.

---

## 4. Verification Plan

1. **Automated Guardrail Test**:
   - Run `node --test apps/web/tests/about-i18n.test.mjs`
2. **Build Validation**:
   - Run `pnpm --filter web build`
3. **Visual Audit**:
   - Confirm background alternating pattern (`bg-surface-muted` <-> `bg-white`) across all 10 sections with ZERO dark section backgrounds.
