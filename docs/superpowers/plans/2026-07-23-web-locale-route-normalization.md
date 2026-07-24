# Web Locale Route Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep one neutral internal App Router tree while exposing properly localized Vietnamese and English URLs through `next-intl`.

**Architecture:** Route folders under `app/[locale]` use English, domain-oriented internal paths only. `next-intl` `pathnames` maps those internal paths to Vietnamese or English public URLs. Shared route constants become the only values used by navigation and feature links; old duplicate URLs receive permanent redirects.

**Tech Stack:** Next.js App Router, next-intl routing/navigation, TypeScript, Node test runner.

## Global Constraints

- Keep every `app/**/page.tsx` as a thin server component.
- Do not duplicate page implementations for different languages.
- UI copy stays in `vi.json` and `en.json`; route folders never encode display language.
- Preserve old URLs with permanent redirects.
- Do not change view behavior or design during this refactor.

---

### Task 1: Lock the canonical route contract

**Files:**

- Create: `apps/web/tests/locale-routes.test.mjs`
- Create: `apps/web/src/constants/routes.constants.ts`

**Interfaces:**

- Produces: `APP_ROUTES`, a typed object containing internal route paths.
- Produces: a source-level test that rejects duplicate Vietnamese/English route folders.

- [ ] **Step 1: Write the failing route-structure test**

Assert that canonical folders exist:

```js
const canonicalPages = [
  "about/page.tsx",
  "products/page.tsx",
  "products/[slug]/page.tsx",
  "warranty/page.tsx",
  "warranty/lookup/page.tsx",
  "warranty/activate/page.tsx",
  "warranty/request/page.tsx",
  "warranty/track/page.tsx",
  "dealers/page.tsx",
  "support-centers/page.tsx",
  "contact/page.tsx",
  "guide/page.tsx",
  "policies/page.tsx",
  "policies/general/page.tsx",
  "policies/privacy/page.tsx",
  "policies/purchasing/page.tsx",
  "policies/warranty-return/page.tsx",
  "policies/shipping/page.tsx",
  "policies/payment/page.tsx",
];
```

Reject legacy implementation folders such as `gioi-thieu`, `san-pham`, `bao-hanh`, `lien-he`, `he-thong-dai-ly`, `policy`, and `chinh-sach-*`.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
node --test apps\web\tests\locale-routes.test.mjs
```

Expected: FAIL because duplicate and Vietnamese-named route folders still exist.

- [ ] **Step 3: Add shared internal route constants**

Create:

```ts
export const APP_ROUTES = {
  home: "/",
  about: "/about",
  products: "/products",
  product: (slug: string) => `/products/${slug}` as const,
  warranty: "/warranty",
  warrantyLookup: "/warranty/lookup",
  warrantyActivate: "/warranty/activate",
  warrantyRequest: "/warranty/request",
  warrantyTrack: "/warranty/track",
  dealers: "/dealers",
  supportCenters: "/support-centers",
  contact: "/contact",
  guide: "/guide",
  policies: "/policies",
  policyGeneral: "/policies/general",
  policyPrivacy: "/policies/privacy",
  policyPurchasing: "/policies/purchasing",
  policyWarrantyReturn: "/policies/warranty-return",
  policyShipping: "/policies/shipping",
  policyPayment: "/policies/payment",
} as const;
```

### Task 2: Configure localized public pathnames

**Files:**

- Modify: `apps/web/src/i18n/routing.ts`
- Test: `apps/web/tests/locale-routes.test.mjs`

**Interfaces:**

- Consumes: canonical internal paths from Task 1.
- Produces: Vietnamese and English public URLs through `next-intl`.

- [ ] **Step 1: Extend the test with the expected localized mapping**

The expected contract is:

| Internal                    | Vietnamese                     | English                     |
| --------------------------- | ------------------------------ | --------------------------- |
| `/about`                    | `/gioi-thieu`                  | `/about`                    |
| `/products`                 | `/san-pham`                    | `/products`                 |
| `/products/[slug]`          | `/san-pham/[slug]`             | `/products/[slug]`          |
| `/warranty`                 | `/bao-hanh`                    | `/warranty`                 |
| `/warranty/lookup`          | `/bao-hanh/tra-cuu`            | `/warranty/lookup`          |
| `/warranty/activate`        | `/bao-hanh/kich-hoat`          | `/warranty/activate`        |
| `/warranty/request`         | `/bao-hanh/yeu-cau`            | `/warranty/request`         |
| `/warranty/track`           | `/bao-hanh/theo-doi`           | `/warranty/track`           |
| `/dealers`                  | `/he-thong-dai-ly`             | `/dealers`                  |
| `/support-centers`          | `/trung-tam-ho-tro`            | `/support-centers`          |
| `/contact`                  | `/lien-he`                     | `/contact`                  |
| `/guide`                    | `/huong-dan`                   | `/guide`                    |
| `/policies`                 | `/chinh-sach`                  | `/policies`                 |
| `/policies/general`         | `/chinh-sach-quy-dinh-chung`   | `/policies/general`         |
| `/policies/privacy`         | `/chinh-sach-bao-mat`          | `/policies/privacy`         |
| `/policies/purchasing`      | `/chinh-sach-mua-hang`         | `/policies/purchasing`      |
| `/policies/warranty-return` | `/chinh-sach-bao-hanh-doi-tra` | `/policies/warranty-return` |
| `/policies/shipping`        | `/chinh-sach-giao-hang`        | `/policies/shipping`        |
| `/policies/payment`         | `/chinh-sach-thanh-toan`       | `/policies/payment`         |

- [ ] **Step 2: Add `pathnames` to `defineRouting`**

Use the table above exactly and keep `locales: ["vi", "en"]` with `defaultLocale: "vi"`.

- [ ] **Step 3: Run the route test**

Expected: pathname mapping assertions pass while the folder test still fails.

### Task 3: Consolidate the App Router tree

**Files:**

- Create: canonical page wrappers listed in Task 1.
- Delete: duplicate route folders rejected by the test.

**Interfaces:**

- Consumes: existing views in `src/views`.
- Produces: one thin page wrapper for each internal route.

- [ ] **Step 1: Add missing canonical wrappers**

Add `/warranty/page.tsx`, `/dealers/page.tsx`, and `/policies/**/page.tsx`, each importing and rendering the existing corresponding view.

- [ ] **Step 2: Preserve existing canonical wrappers**

Keep `/about`, `/products`, `/products/[slug]`, `/contact`, `/guide`, `/support-centers`, and `/warranty/*`.

- [ ] **Step 3: Delete duplicate implementation folders**

Remove:

```text
gioi-thieu
san-pham
bao-hanh
lien-he
he-thong-dai-ly
policy
chinh-sach-bao-hanh-doi-tra
chinh-sach-bao-mat
chinh-sach-giao-hang
chinh-sach-mua-hang
chinh-sach-quy-dinh-chung
chinh-sach-thanh-toan
```

- [ ] **Step 4: Run route and thin-page policy tests**

```powershell
node --test apps\web\tests\locale-routes.test.mjs
node --test --test-name-pattern="route page files" apps\web\tests\source-policy.test.mjs
```

Expected: both pass.

### Task 4: Replace hardcoded navigation paths

**Files:**

- Modify: `apps/web/src/components/layout/site-header.tsx`
- Modify: `apps/web/src/components/floating-quick-action.tsx`
- Modify: `apps/web/src/views/home/home.constants.ts`
- Modify: `apps/web/src/views/home/components/about-section.tsx`
- Modify: `apps/web/src/views/home/components/additional-products-section.tsx`
- Modify: `apps/web/src/views/home/components/products-section.tsx`
- Modify: `apps/web/src/views/products/products.view.tsx`
- Modify: `apps/web/src/views/product-detail/product-detail.view.tsx`
- Modify: `apps/web/src/views/about/about.view.tsx`
- Modify: `apps/web/src/views/warranty/warranty.constants.ts`

**Interfaces:**

- Consumes: `APP_ROUTES`.
- Produces: locale-aware links that always use internal canonical paths.

- [ ] **Step 1: Add a failing test for legacy hrefs**

Reject string literals containing implementation links such as `/gioi-thieu`, `/san-pham`, `/bao-hanh`, `/lien-he`, `/he-thong-dai-ly`, and `/chinh-sach-*` outside the pathname mapping and redirect configuration.

- [ ] **Step 2: Replace links with `APP_ROUTES`**

Use `APP_ROUTES.product(slug)` for dynamic product links and named constants for all static links.

- [ ] **Step 3: Simplify header active-path logic**

Each navigation item has one internal canonical `href`; remove bilingual `activePaths` arrays. `usePathname()` from next-intl returns the internal pathname contract.

- [ ] **Step 4: Run route tests and ESLint**

Expected: no legacy internal href remains.

### Task 5: Preserve legacy URLs and verify routing

**Files:**

- Modify: `apps/web/next.config.js`
- Test: `apps/web/tests/locale-routes.test.mjs`

**Interfaces:**

- Produces: permanent redirects from previously exposed mixed-language URLs.

- [ ] **Step 1: Add redirects for old duplicate URLs**

Examples:

```js
{source: "/vi/about", destination: "/vi/gioi-thieu", permanent: true}
{source: "/en/gioi-thieu", destination: "/en/about", permanent: true}
{source: "/vi/products/:path*", destination: "/vi/san-pham/:path*", permanent: true}
{source: "/en/san-pham/:path*", destination: "/en/products/:path*", permanent: true}
```

Cover about, products, warranty, dealers, contact, and policy routes.

- [ ] **Step 2: Run typecheck, lint, route tests, and diff checks**

```powershell
pnpm.cmd --filter @repo/web exec tsc --noEmit
pnpm.cmd --filter @repo/web lint
node --test apps\web\tests\locale-routes.test.mjs
node --test apps\web\tests\source-policy.test.mjs
git diff --check
```

- [ ] **Step 3: Smoke-test localized public URLs**

Verify HTTP `200` for `/vi/gioi-thieu`, `/en/about`, `/vi/san-pham`, `/en/products`, `/vi/bao-hanh`, `/en/warranty`, every policy URL, and both dealer/contact URLs. Verify old mixed URLs return permanent redirects.
