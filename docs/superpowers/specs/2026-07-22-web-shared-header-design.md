# Shared Public Website Header

## Goal

Display one consistent FUJITEK header on every locale-aware public page, including the home page, introduction, warranty, policy, guide, and support-center routes.

## Architecture

- Extract the navigation currently embedded in `HeroSection` into `apps/web/src/components/layout/site-header.tsx`.
- Render `SiteHeader` once from `apps/web/app/[locale]/layout.tsx`, inside `NextIntlClientProvider` and before the route content.
- Remove the extracted navigation and mobile-menu state from `HeroSection` so the home page renders only one header.
- Keep client-only menu behavior inside `SiteHeader`; the locale layout remains a server component.

## Navigation

Use the locale-aware `Link` exported by `apps/web/src/i18n/navigation.ts`.

- Trang chủ: `/`
- Giới thiệu: `/gioi-thieu`
- Sản phẩm: `/#products`
- Bảo hành: `/bao-hanh`
- Hệ thống đại lý: `/support-centers`
- Tin tức: retain the visible item as disabled text until a dedicated route or section exists.
- Liên hệ: `/#contact`; add the `contact` anchor to the existing home-page CTA section.

Home-page section links include the root path so they also work when clicked from another page. Existing Vietnamese labels and visual styling remain unchanged.

The existing action and search controls currently call a home-view callback that only scrolls toward a non-rendered section. In the shared header, both controls will use real route navigation instead: the primary action links to `/support-centers`, and search links to `/warranty/lookup`.

## Layout Behavior

The header remains fixed at the top with its current height and responsive desktop/mobile presentation. The locale layout owns a shared `84px` top offset so route content begins below it. The introduction view removes its local duplicate offset, and the home hero uses `calc(100dvh - 84px)` to remain within the initial viewport.

Only one component owns header dimensions, styling, navigation items, and mobile-menu behavior.

## Validation

- Verify the header appears once on every route under both `/vi` and `/en`.
- Verify desktop and mobile navigation can open and close without layout overflow.
- Verify locale prefixes are preserved during route navigation.
- Verify home-page product anchoring works from both the home page and inner pages.
- Verify the contact anchor reaches the existing home-page CTA section.
- Verify `/bao-hanh`, `/support-centers`, and `/warranty/lookup` links resolve successfully.
- Run the web app typecheck and lint commands available in the package.

## Scope

This change does not create news or contact pages, redesign the header, translate its current Vietnamese labels, or alter page content below the header.
