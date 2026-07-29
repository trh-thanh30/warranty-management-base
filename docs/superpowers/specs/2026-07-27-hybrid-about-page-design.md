# Hybrid About Page Design Specification (Brand, Product Ecosystem & Film Tech)

> **Date:** 2026-07-27
> **Topic:** Redesign `/about` as a Unified Brand, Product Ecosystem & 3D Film Technology Page

---

## 1. Goal & Intent

Redesign the main `/about` page of `apps/web` into a comprehensive **Unified Brand, Product Ecosystem & Film Technology Hub**. This page balances corporate credibility (brand history, cleanroom craftsmanship, nationwide dealer network, E-Warranty) with FUJITEK - LEXZENZ's core product ecosystem (4 main product lines) and 3D film technology showcase (5-layer film anatomy & Sputtering/Nano Ceramic tabs).

---

## 2. Architecture & File Structure

Following `docs/architecture/frontend-folder-structure.md`:

```
apps/web/
├── app/[locale]/about/page.tsx                     # Thin server page importing AboutView
├── src/views/about/
│   ├── about.types.ts                              # View state, product & film layer interfaces
│   ├── about.constants.ts                          # Ecosystem products, film layers, stats, milestones
│   ├── about.metadata.ts                           # SEO metadata generator
│   ├── about.view.tsx                              # Main About page view assembly
│   └── components/                                 # Modular component architecture
│       ├── about-hero-corporate.tsx                # Hero banner & key metrics
│       ├── about-timeline.tsx                      # History & milestones timeline
│       ├── about-product-ecosystem.tsx             # [NEW] 4 Core product lines (Film, Lighting, Dashcam, TPMS)
│       ├── about-film-layers.tsx                   # 3D interactive 5-layer film anatomy stack
│       ├── about-core-tech.tsx                     # Tabbed Sputtering vs Nano Ceramic technology
│       ├── about-craftsmanship.tsx                 # Cleanroom standards & certified technicians
│       ├── about-network-banner.tsx                # Dealer network map & E-Warranty commitment
│       ├── about-testimonials.tsx                  # Dealer partner & customer feedback grid
│       └── about-b2b-cta.tsx                       # Partner application & contact CTA
├── src/messages/
│   ├── vi.json                                     # Vietnamese translations (AboutPage schema)
│   └── en.json                                     # English translations (AboutPage schema)
└── tests/
    └── about-i18n.test.mjs                         # Guardrail for zero hardcoded copy & schema match
```

---

## 3. Section Sequence & Component Blueprint

1. **`AboutHeroCorporate`**: Vị thế thương hiệu FUJITEK - LEXZENZ Việt Nam & các con số quy mô (Năm kinh nghiệm, Số đại lý, Số xe đã thi công, Chuẩn ISO 9001).
2. **`AboutTimeline`**: Lịch sử phát triển từ R&D tại Nhật Bản đến mở rộng hệ thống tại Việt Nam.
3. **`AboutProductEcosystem`**: Trình bày 4 danh mục sản phẩm cốt lõi:
   - _Film cách nhiệt ô tô Lexzenz Reflex Korea Film_
   - _Đèn tăng sáng ô tô, xe máy Lexzenz Led Fujitek_
   - _Camera hành trình Lexzenz Dashcam_
   - _Cảm biến Áp suất lốp TPMS Lexzenz_
4. **`AboutFilmLayers`**: Mô hình giải phẫu 3D 5 lớp phim cách nhiệt (Scratch Coat, Sputter Metal, Optical PET, Nano Ceramic, Adhesive).
5. **`AboutCoreTech`**: Tab chuyển đổi giữa công nghệ Phún xạ kim loại (_Sputtering_) và _Nano Ceramic_.
6. **`AboutCraftsmanship`**: Phòng dán phim sạch bụi Class 1000 & Đội ngũ kỹ thuật viên cấp chứng chỉ.
7. **`AboutNetworkBanner`**: Bản đồ mạng lưới 100+ đại lý toàn quốc & Hệ thống tra cứu E-Warranty.
8. **`AboutTestimonials`**: Phản hồi từ các đối tác Showroom & Khách hàng.
9. **`AboutB2BCta`**: Khối kêu gọi đăng ký Đại lý ủy quyền & liên hệ B2B.

---

## 4. Typography & Design Tokens

- **Titles / Stats**: `--font-condensed` (`Saira Condensed`), `uppercase`, `tracking-tight`.
- **Body / Labels**: `--font-sans` (`Maven Pro`), `font-normal` or `font-semibold`.
- **Color Palette**: Primitive & Semantic tokens (`premium-red`, `deep-black`, `stone-gray`, `surface-muted`, `border-gray`).

---

## 5. Verification Plan

1. **Automated i18n & Guardrail Tests**:
   - `node --test apps/web/tests/about-i18n.test.mjs`
2. **Build Validation**:
   - `pnpm --filter web build`
3. **Manual Responsive Test**:
   - Mobile (<640px), Tablet (768px - 1024px), Desktop (>1280px).
