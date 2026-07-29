# Web Shared Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render one responsive, locale-aware FUJITEK header across every public web route.

**Architecture:** Move header ownership from the home hero into a focused client layout component rendered by the locale server layout. Use locale-aware links for real routes and root-qualified anchors for home sections, while keeping route content responsible only for its own top spacing.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, next-intl, Framer Motion, Tailwind CSS, Node built-in test runner.

## Global Constraints

- Preserve the existing header visual design and responsive desktop/mobile behavior.
- Keep `app/[locale]/layout.tsx` as a server component.
- Do not add dependencies.
- Do not create news or contact pages.
- Preserve unrelated user changes in the dirty worktree.

---

### Task 1: Add an HTTP regression test for the shared header

**Files:**

- Create: `apps/web/tests/shared-header.test.mjs`

**Interfaces:**

- Consumes: a running web development server at `WEB_BASE_URL`, defaulting to `http://localhost:4101`.
- Produces: Node tests proving the header is rendered exactly once on home and inner pages and exposes locale-aware destinations.

- [ ] **Step 1: Write the failing integration test**

```js
import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.WEB_BASE_URL ?? "http://localhost:4101";

async function getPage(path) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, 200);
  return response.text();
}

for (const path of [
  "/vi",
  "/vi/gioi-thieu",
  "/vi/bao-hanh",
  "/vi/support-centers",
]) {
  test(`${path} renders one shared site header`, async () => {
    const html = await getPage(path);
    assert.equal((html.match(/data-site-header=/g) ?? []).length, 1);
  });
}

test("Vietnamese header exposes real localized destinations", async () => {
  const html = await getPage("/vi/gioi-thieu");
  for (const href of [
    "/vi/gioi-thieu",
    "/vi/bao-hanh",
    "/vi/support-centers",
    "/vi/warranty/lookup",
  ]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
});
```

- [ ] **Step 2: Run the test and confirm the missing-header failure**

Run: `node --test apps/web/tests/shared-header.test.mjs`

Expected: the inner-page tests fail because `data-site-header` occurs zero times.

---

### Task 2: Extract and mount the shared header

**Files:**

- Create: `apps/web/src/components/layout/site-header.tsx`
- Modify: `apps/web/app/[locale]/layout.tsx`
- Modify: `apps/web/src/views/home/components/hero-section.tsx`
- Modify: `apps/web/src/views/home/home.view.tsx`
- Modify: `apps/web/src/views/home/components/cta-section.tsx`

**Interfaces:**

- Consumes: `Link` from `@/src/i18n/navigation`, `/logo.png`, and Framer Motion.
- Produces: `export function SiteHeader(): React.JSX.Element` and the `data-site-header` test hook.

- [ ] **Step 1: Create `SiteHeader` from the existing navigation**

Move the desktop and mobile navigation markup and `isMobileMenuOpen` state from `HeroSection`. Define the navigation once:

```tsx
const navigationItems = [
  { label: "TRANG CHỦ", href: "/" },
  { label: "GIỚI THIỆU", href: "/gioi-thieu" },
  { label: "SẢN PHẨM", href: "/#products" },
  { label: "BẢO HÀNH", href: "/bao-hanh" },
  { label: "HỆ THỐNG ĐẠI LÝ", href: "/support-centers" },
  { label: "TIN TỨC", href: null },
  { label: "LIÊN HỆ", href: "/#contact" },
] as const;
```

Render `href: null` as an `aria-disabled="true"` span. Render all real destinations with locale-aware `Link`. Replace the existing callback buttons with links to `/support-centers` and `/warranty/lookup`. Put `data-site-header` on the fixed `<header>` element.

- [ ] **Step 2: Mount the header in the locale layout**

```tsx
import { SiteHeader } from "@/src/components/layout/site-header";

<NextIntlClientProvider messages={messages}>
  <SiteHeader />
  {children}
</NextIntlClientProvider>;
```

- [ ] **Step 3: Remove header-only behavior from `HeroSection`**

Remove `Menu`, `X`, `Send`, and `Search` imports if unused, remove `isMobileMenuOpen`, remove the entire fixed navigation block, and remove the `onOpenHub` prop because the hero no longer invokes it.

Put the shared top offset around route content in the locale layout:

```tsx
<SiteHeader />
<div className="pt-[84px]">{children}</div>
```

Remove the introduction view's local `pt-[84px]`. Change the hero root so the header and hero together remain within the initial viewport:

```tsx
<section id="home" className="relative flex h-[calc(100dvh-84px)] flex-col overflow-hidden">
```

Update `HomeView` to render `<HeroSection />`.

- [ ] **Step 4: Add the contact anchor to the existing footer CTA**

```tsx
<footer
  id="contact"
  className="scroll-mt-[84px] w-full bg-white text-[#040708] border-t border-[#DFDFDF] font-sans"
>
```

- [ ] **Step 5: Run focused verification**

Run: `node --test apps/web/tests/shared-header.test.mjs`

Expected: all tests pass.

Run: `pnpm.cmd --filter @repo/web check-types`

Expected: exit code 0.

Run: `pnpm.cmd --filter @repo/web lint`

Expected: either exit code 0 or only the already-observed baseline warnings; no warning may originate from `site-header.tsx` or newly changed imports.

---

### Task 3: Validate route behavior and change isolation

**Files:**

- Verify: all files changed in Tasks 1 and 2.

**Interfaces:**

- Consumes: the completed shared header and running development server.
- Produces: evidence that the change satisfies the design without modifying unrelated user work.

- [ ] **Step 1: Inspect the final diff**

Run: `git diff --check` and `git diff -- apps/web docs/superpowers`.

Expected: no whitespace errors; only the shared-header implementation, test, spec, and plan are attributable to this task.

- [ ] **Step 2: Verify rendered HTML directly**

Run the Node integration test once more after typecheck. Expected: all tests pass for `/vi`, `/vi/gioi-thieu`, `/vi/bao-hanh`, and `/vi/support-centers`.

- [ ] **Step 3: Report baseline failures separately**

If lint still fails because of existing warnings outside the changed header code, report the exact count and affected files without modifying unrelated code.
