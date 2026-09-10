# Controlled Homepage Visual Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary homepage form/iframe preview with a locked Puck editor that lets administrators edit each homepage text and approved style directly on the real page canvas.

**Architecture:** A new `@repo/homepage` package owns the fixed homepage schema adapters, style-token renderer, and eight presentational sections. Admin supplies the Puck editing runtime and draft/publish actions; Web uses the same renderer without loading Puck. Existing website revision JSON remains the persistence boundary and old string-based revisions are normalized to styled text at read time.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, `@puckeditor/core`, Tailwind CSS 4, NestJS, Prisma/PostgreSQL, next-intl, node:test/Jest.

## Global Constraints

- Homepage route remains `apps/web/app/[locale]/page.tsx`, currently named `AboutView` internally.
- Keep exactly eight sections in their current order; disable insert, delete, duplicate, and drag.
- Permit per-text inline editing plus preset font, size, color, alignment, bold, and italic only.
- Never persist arbitrary HTML, CSS, Tailwind classes, JavaScript, font names, colors, or pixel sizes.
- Draft changes must not affect public Web until publish succeeds.
- Preserve `WEBSITE_CONFIG_VIEW`, `WEBSITE_CONFIG_UPDATE`, and `WEBSITE_CONFIG_PUBLISH` authorization semantics.
- Commit after each completed task, staging only files owned by that task.

---

## File map

### New shared rendering package

- `packages/homepage/package.json`: package exports and dependencies.
- `packages/homepage/tsconfig.json`: React library configuration.
- `packages/homepage/src/index.ts`: export-only entrypoint.
- `packages/homepage/src/homepage.types.ts`: renderer props and the eight fixed component types.
- `packages/homepage/src/editable-text.tsx`: maps approved style tokens to classes and renders text.
- `packages/homepage/src/homepage-renderer.tsx`: fixed section composition.
- `packages/homepage/src/components/*.tsx`: presentational homepage sections moved from Web.
- `packages/homepage/tests/homepage-renderer.test.tsx`: fixed-order and style-token tests.

### Shared contracts

- `packages/shared/src/types/website-homepage.types.ts`: styled-text domain schema.
- `packages/shared/src/constants/website-homepage.constants.ts`: styled defaults for VI/EN.
- `packages/shared/src/utils/website-homepage.ts`: legacy normalization and validation.
- `packages/shared/tests/website-homepage.test.ts`: legacy migration and invalid-token tests.

### API

- `apps/api/src/modules/website-config/dto/website-config.dto.ts`: nested styled-text DTO.
- `apps/api/src/modules/website-config/service/website-config-policy.service.ts`: publish validation.
- `apps/api/src/modules/website-config/tests/website-config-policy.service.spec.ts`: valid/invalid style tests.
- Existing Prisma `homepage_content` JSON column remains unchanged.

### Admin

- `apps/admin/package.json`: add `@puckeditor/core` and `@repo/homepage`.
- `apps/admin/src/views/website-config/site/components/homepage-visual-editor.tsx`: controlled Puck instance.
- `apps/admin/src/views/website-config/site/components/homepage-puck.config.tsx`: eight locked component configs and fields.
- `apps/admin/src/views/website-config/site/components/homepage-puck.adapters.ts`: domain ↔ Puck conversion.
- `apps/admin/src/views/website-config/site/components/homepage-style-field.tsx`: preset style controls.
- `apps/admin/src/views/website-config/site/components/website-site-config-form.tsx`: mount visual editor.
- Delete `apps/admin/src/views/website-config/site/components/homepage-content-editor.tsx`.
- Delete `apps/admin/src/views/website-config/components/homepage-preview-dialog.tsx`.
- Remove the page-header preview action; the MVP embeds Puck as the single preview inside the homepage tab.
- `apps/admin/src/messages/{vi,en}.json`: Puck labels and validation text.
- `apps/admin/src/views/website-config/site/components/*.test.ts`: adapter/config policy tests.

### Web

- `apps/web/package.json`: add `@repo/homepage`.
- `apps/web/src/views/about/about.view.tsx`: fetch published data and call package renderer.
- Remove duplicated presentational composition from `apps/web/src/views/about/about-page-renderer.tsx` after migration.
- Delete `apps/web/src/views/homepage-preview/homepage-preview.view.tsx` and `apps/web/app/[locale]/preview/homepage/page.tsx` because Puck canvas becomes the preview.
- Update `apps/web/tests/homepage-renderer.test.mjs` and remove the obsolete postMessage bridge test.

---

### Task 1: Define the styled homepage contract and legacy resolver

**Files:**

- Modify: `packages/shared/src/types/website-homepage.types.ts`
- Modify: `packages/shared/src/constants/website-homepage.constants.ts`
- Modify: `packages/shared/src/utils/website-homepage.ts`
- Modify: `packages/shared/tests/website-homepage.test.ts`

**Interfaces:**

- Produces `WebsiteEditableText`, `WebsiteTextStyle`, and normalized `WebsiteHomepageContentByLocale`.
- Produces `resolveWebsiteHomepageContent(value: unknown): WebsiteHomepageContentByLocale` that accepts both legacy strings and styled values.

- [ ] **Step 1: Add failing tests for legacy conversion and token validation**

```ts
test("wraps legacy homepage strings with field defaults", () => {
  const value = resolveWebsiteHomepageContent({
    vi: { landing: { hero: { titlePrefix: "Tiêu đề cũ" } } },
  });
  assert.deepEqual(value.vi.landing.hero.titlePrefix, {
    content: "Tiêu đề cũ",
    font: "heading",
    size: "2xl",
    color: "default",
    align: "left",
    bold: true,
    italic: false,
  });
});

test("rejects arbitrary style values", () => {
  assert.equal(
    isWebsiteEditableText({
      content: "Unsafe",
      font: "Comic Sans",
      size: "72px",
      color: "#ff00ff",
      align: "left",
      bold: false,
      italic: false,
    }),
    false,
  );
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run from `apps/admin` because that package provides `tsx`:

```powershell
pnpm exec tsx --test ../../packages/shared/tests/website-homepage.test.ts
```

Expected: failure because styled text types/resolver do not exist.

- [ ] **Step 3: Add the exact token types and guard**

```ts
export type WebsiteTextStyle = {
  font: "heading" | "body";
  size: "s" | "m" | "l" | "xl" | "2xl";
  color: "default" | "muted" | "primary" | "inverse";
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
};

export type WebsiteEditableText = WebsiteTextStyle & { content: string };
```

Add `isWebsiteEditableText(value: unknown)` using Zod enums for all six style properties. Replace every editable landing string with `WebsiteEditableText`; keep system-only labels outside the editable landing contract.

- [ ] **Step 4: Implement field-aware legacy normalization**

Use a default styled tree as the shape source. For each default `WebsiteEditableText`, accept a stored string by copying it into `content`, or merge a stored object only when its tokens pass the guard. Arrays continue to replace atomically. Never mutate the stored input.

- [ ] **Step 5: Run tests and typecheck**

```powershell
pnpm exec tsx --test ../../packages/shared/tests/website-homepage.test.ts
pnpm --filter @repo/shared check-types
```

Expected: all homepage tests pass and TypeScript exits 0.

---

### Task 2: Validate and persist styled content through the API

**Files:**

- Modify: `apps/api/src/modules/website-config/dto/website-config.dto.ts`
- Modify: `apps/api/src/modules/website-config/service/website-config-policy.service.ts`
- Modify: `apps/api/src/modules/website-config/tests/website-config-policy.service.spec.ts`
- Modify: `apps/api/src/modules/website-config/use-cases/website-site-config.use-case.ts`

**Interfaces:**

- Consumes normalized `WebsiteEditableText` from Task 1.
- Preserves the existing `homepage_content Json` column and site-settings endpoints.

- [ ] **Step 1: Add failing publish-policy tests**

```ts
it("rejects blank editable text content", () => {
  const draft = createValidDraft();
  draft.homepage.content.vi.landing.hero.titlePrefix.content = "   ";
  expect(() => service.assertSitePublishable(draft)).toThrow(
    expect.objectContaining({
      details: {
        field: "homepage.content.vi.landing.hero.titlePrefix.content",
      },
    }),
  );
});

it("accepts every approved text token", () => {
  expect(() => service.assertSitePublishable(createValidDraft())).not.toThrow();
});
```

- [ ] **Step 2: Run focused API tests and confirm RED**

```powershell
pnpm --filter @repo/api test -- website-config-policy.service.spec.ts
```

- [ ] **Step 3: Introduce `WebsiteEditableTextDto`**

```ts
class WebsiteEditableTextDto {
  @IsString() @MaxLength(5000) content: string;
  @IsIn(["heading", "body"]) font: "heading" | "body";
  @IsIn(["s", "m", "l", "xl", "2xl"]) size: "s" | "m" | "l" | "xl" | "2xl";
  @IsIn(["default", "muted", "primary", "inverse"]) color:
    | "default"
    | "muted"
    | "primary"
    | "inverse";
  @IsIn(["left", "center", "right"]) align: "left" | "center" | "right";
  @IsBoolean() bold: boolean;
  @IsBoolean() italic: boolean;
}
```

Apply it with `@ValidateNested()` and `@Type(() => WebsiteEditableTextDto)` to every editable landing field.

- [ ] **Step 4: Validate leaf content and tokens at publish time**

Update recursive policy validation so a styled text object is treated as one leaf. Report the `.content` path for blank text. Reject malformed tokens even if requests bypass DTO transformation.

- [ ] **Step 5: Verify API behavior**

```powershell
pnpm --filter @repo/api test -- website-config-policy.service.spec.ts
pnpm --filter @repo/api check-types
```

Expected: focused suite and typecheck pass. No Prisma migration is generated.

---

### Task 3: Create `@repo/homepage` and move the canonical renderer

**Files:**

- Create: `packages/homepage/package.json`
- Create: `packages/homepage/tsconfig.json`
- Create: `packages/homepage/src/index.ts`
- Create: `packages/homepage/src/homepage.types.ts`
- Create: `packages/homepage/src/editable-text.tsx`
- Create: `packages/homepage/src/homepage-renderer.tsx`
- Create: `packages/homepage/src/components/about-hero-corporate.tsx`
- Create: `packages/homepage/src/components/about-brand-heritage.tsx`
- Create: `packages/homepage/src/components/about-core-tech.tsx`
- Create: `packages/homepage/src/components/about-timeline.tsx`
- Create: `packages/homepage/src/components/about-vision-values.tsx`
- Create: `packages/homepage/src/components/about-network-banner.tsx`
- Create: `packages/homepage/src/components/about-testimonials.tsx`
- Create: `packages/homepage/src/components/about-b2b-cta.tsx`
- Create: `packages/homepage/tests/homepage-renderer.test.tsx`

**Interfaces:**

- Produces `HomepageRenderer(props: HomepageRendererProps)` for Admin and Web.
- `HomepageRendererProps` injects links, image URLs, hotline, map slot, and translated non-editable item copy so the package does not import app providers or `next-intl`.

- [ ] **Step 1: Add a failing fixed-order renderer test**

```tsx
const html = renderToStaticMarkup(<HomepageRenderer {...fixture} />);
const ids = [
  "hero",
  "brand-heritage",
  "core-tech",
  "milestones",
  "pillars",
  "network",
  "testimonials",
  "b2b",
];
const positions = ids.map((id) =>
  html.indexOf(`data-homepage-section="${id}"`),
);
assert.ok(positions.every((position) => position >= 0));
assert.deepEqual(
  positions,
  [...positions].sort((a, b) => a - b),
);
```

- [ ] **Step 2: Add a failing style-token renderer test**

Render `{ font: 'heading', size: '2xl', color: 'primary', align: 'center', bold: true, italic: false }` and assert the output contains only the approved class map, including `text-premium-red` and `text-center`, with no persisted raw class string.

- [ ] **Step 3: Scaffold the package**

`package.json` must export `./src/index.ts`, provide `build`, `check-types`, and `lint`, depend on `@repo/shared`, `framer-motion`, `lucide-react`, and declare React peer dependencies. Do not depend on Next.js, next-intl, Admin, or Web.

- [ ] **Step 4: Implement the approved class map**

```ts
const fontClasses = { heading: "font-heading", body: "font-sans" } as const;
const sizeClasses = {
  s: "text-sm",
  m: "text-base",
  l: "text-xl",
  xl: "text-3xl",
  "2xl": "text-5xl",
} as const;
const colorClasses = {
  default: "text-deep-black",
  muted: "text-stone-gray",
  primary: "text-premium-red",
  inverse: "text-white",
} as const;
const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;
```

`EditableText` combines only these maps plus `font-bold`/`font-normal` and `italic`/`not-italic`.

- [ ] **Step 5: Move presentational sections and inject app-specific behavior**

Replace calls to `useTranslations`, Web route helpers, quick-chat events, site-setting providers, and dynamic map imports with typed props/slots. Preserve existing markup, responsive classes, motion, and fixed ordering. Use ordinary `<img>` or an injected `ImageComponent` adapter to avoid a hard Next.js dependency.

- [ ] **Step 6: Export and verify package**

```powershell
pnpm --filter @repo/homepage check-types
pnpm --filter @repo/homepage test
```

Expected: renderer order and token tests pass.

---

### Task 4: Adapt Web to the canonical package renderer

**Files:**

- Modify: `apps/web/package.json`
- Modify: `apps/web/src/views/about/about.view.tsx`
- Modify: `apps/web/src/views/about/about.constants.ts`
- Delete after migration: `apps/web/src/views/about/about-page-renderer.tsx`
- Delete moved components under `apps/web/src/views/about/components/` only after all imports are replaced.
- Modify: `apps/web/tests/homepage-renderer.test.mjs`

**Interfaces:**

- Consumes `HomepageRenderer` from Task 3 and normalized published copy from Task 1.
- Produces the public `/vi` and `/en` homepage without Puck runtime.

- [ ] **Step 1: Update the source-level test to require `@repo/homepage`**

```js
assert.match(aboutView, /import \{ HomepageRenderer \} from "@repo\/homepage"/);
assert.doesNotMatch(aboutView, /@puckeditor\/core/);
```

- [ ] **Step 2: Run Web test and confirm RED**

```powershell
pnpm --filter @repo/web test -- homepage-renderer.test.mjs
```

- [ ] **Step 3: Build Web adapter props**

In `about.view.tsx`, fetch published site settings, normalize fallback copy, and pass route URLs, hotline, translated timeline/pillar/testimonial item data, and map slot to `HomepageRenderer`. Keep public data sourced only from `getCachedSiteSetting(locale)`.

- [ ] **Step 4: Remove duplicate renderer files**

Delete Web-owned copies only after `rg "AboutHeroCorporate|AboutPageRenderer" apps/web/src` shows no imports other than removed files.

- [ ] **Step 5: Verify Web**

```powershell
pnpm --filter @repo/shared build
pnpm --filter @repo/homepage check-types
pnpm --filter @repo/web test -- homepage-renderer.test.mjs
pnpm --filter @repo/web check-types
```

Expected: tests pass and Web contains no `@puckeditor/core` import.

---

### Task 5: Build domain-to-Puck adapters and locked config

**Files:**

- Modify: `apps/admin/package.json`
- Create: `apps/admin/src/views/website-config/site/components/homepage-puck.adapters.ts`
- Create: `apps/admin/src/views/website-config/site/components/homepage-puck.config.tsx`
- Create: `apps/admin/src/views/website-config/site/components/homepage-style-field.tsx`
- Create: `apps/admin/src/views/website-config/site/components/homepage-puck.adapters.test.ts`
- Create: `apps/admin/src/views/website-config/site/components/homepage-puck.config.test.ts`

**Interfaces:**

- Produces `toHomepagePuckData(copy): Data<HomepagePuckComponents>`.
- Produces `fromHomepagePuckData(data): WebsiteHomepageCopy["landing"]`.
- Produces `createHomepagePuckConfig(metadata): Config<HomepagePuckComponents>`.

- [ ] **Step 1: Install exact dependencies**

```powershell
pnpm --filter @repo/admin add @puckeditor/core @repo/homepage@workspace:*
pnpm --filter @repo/web add @repo/homepage@workspace:*
```

Use the resolved lockfile version; do not add deprecated `@measured/puck`.

- [ ] **Step 2: Write failing round-trip and order tests**

```ts
test("domain to Puck to domain preserves fixed content", () => {
  const initial = DEFAULT_WEBSITE_HOMEPAGE_CONTENT.vi.landing;
  assert.deepEqual(fromHomepagePuckData(toHomepagePuckData(initial)), initial);
});

test("Puck data always contains the eight canonical ids", () => {
  assert.deepEqual(
    toHomepagePuckData(fixture).content.map((item) => item.props.id),
    [
      "homepage-hero",
      "homepage-brand-heritage",
      "homepage-core-tech",
      "homepage-milestones",
      "homepage-pillars",
      "homepage-network",
      "homepage-testimonials",
      "homepage-b2b",
    ],
  );
});
```

- [ ] **Step 3: Implement deterministic adapters**

Create one Puck component per section. Ignore incoming Puck order in `fromHomepagePuckData`; select components by canonical ID and emit domain fields in fixed order. Throw `HomepageEditorDataError` if any canonical component is missing or duplicated.

- [ ] **Step 4: Configure inline fields**

Each editable text exposes `content` as Puck `text` or `textarea` with `contentEditable: true`. Expose style through custom controls whose values are constrained to the six domain tokens. Render components through `@repo/homepage` section exports.

- [ ] **Step 5: Assert permissions and no component insertion UI**

Test exported permissions equal:

```ts
export const homepageEditorPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
  edit: true,
} as const;
```

Read-only mode changes only `edit` to `false`.

- [ ] **Step 6: Run focused Admin tests**

```powershell
pnpm --filter @repo/admin test -- homepage-puck
```

Expected: adapters round-trip and config permissions pass.

---

### Task 6: Replace temporary Admin form and iframe with Puck canvas

**Files:**

- Create: `apps/admin/src/views/website-config/site/components/homepage-visual-editor.tsx`
- Modify: `apps/admin/src/views/website-config/site/components/website-site-config-form.tsx`
- Modify: `apps/admin/src/views/website-config/site/website-site-config.view.tsx`
- Modify: `apps/admin/src/messages/vi.json`
- Modify: `apps/admin/src/messages/en.json`
- Delete: `apps/admin/src/views/website-config/site/components/homepage-content-editor.tsx`
- Delete: `apps/admin/src/views/website-config/components/homepage-preview-dialog.tsx`
- Delete: `apps/admin/src/views/website-config/components/preview-data-dialog.tsx`

**Interfaces:**

- Consumes Task 5 adapters/config and existing `SiteDraftUpdater`.
- Updates `form.homepage.content[locale].landing` on every valid Puck change.
- Existing page-level save and publish mutations remain authoritative.

- [ ] **Step 1: Add a failing source/UI policy test**

Assert the homepage tab imports `HomepageVisualEditor`, does not import `HomepageContentEditor`, and the page header no longer mounts `HomepagePreviewDialog`.

- [ ] **Step 2: Implement controlled Puck editor**

```tsx
<Puck
  config={config}
  data={data}
  onChange={(next) => updateLanding(fromHomepagePuckData(next))}
  permissions={{ ...homepageEditorPermissions, edit: canUpdate }}
  ui={{ leftSideBarVisible: false }}
  viewports={[
    { width: 1440, label: "Desktop" },
    { width: 768, label: "Tablet" },
    { width: 390, label: "Mobile" },
  ]}
/>
```

Import `@puckeditor/core/puck.css` in the editor client boundary or Admin global stylesheet according to package requirements. Hide the component palette; keep fields/sidebar available after selection.

- [ ] **Step 3: Preserve existing draft/publish controls**

Do not use Puck `onPublish` as a second persistence path. The existing `RevisionStatusBar` buttons continue to call `saveDraft()` and `publish()`, ensuring expected-version conflict handling remains unchanged.

- [ ] **Step 4: Add localized labels**

Add VI/EN labels for the eight sections, style controls, three viewports, read-only notice, invalid editor data, and unsaved changes. Rename the tab description from image-only Hero configuration to homepage visual editing.

- [ ] **Step 5: Remove the superseded preview mechanism**

Delete temporary iframe/postMessage code plus `HomepagePreviewMessage` and `isHomepagePreviewMessage`. The Puck canvas is the single preview mechanism.

- [ ] **Step 6: Verify Admin**

```powershell
pnpm --filter @repo/shared build
pnpm --filter @repo/homepage check-types
pnpm --filter @repo/admin test -- homepage-puck
pnpm --filter @repo/admin check-types
```

Expected: editor tests and typecheck pass.

---

### Task 7: Remove obsolete preview route and test draft/publish isolation

**Files:**

- Delete: `apps/web/src/views/homepage-preview/homepage-preview.view.tsx`
- Delete: `apps/web/app/[locale]/preview/homepage/page.tsx`
- Delete: `apps/web/tests/homepage-preview-bridge.test.mjs`
- Modify: `packages/shared/src/types/website-site-setting.types.ts`
- Modify: `packages/shared/src/utils/website-homepage.ts`
- Create: `apps/api/src/modules/website-config/tests/website-site-config.use-case.spec.ts`
- Modify: `apps/api/src/modules/website-config/website-config.controller.ts`
- Modify: `apps/api/src/modules/website-config/use-cases/website-site-config.use-case.ts`
- Modify: `apps/admin/src/services/website-config/create-website-config.service.ts`
- Modify: `apps/admin/src/services/website-config/website-config.service.test.ts`

**Interfaces:**

- Removes `HomepagePreviewMessage` and `isHomepagePreviewMessage` if unused.
- Removes the now-unused API `GET /website-config/site-settings/preview` endpoint and Admin `previewSite` service method; Puck receives the draft already loaded by `useWebsiteSite`.

- [ ] **Step 1: Add an API regression test for revision isolation**

```ts
it("keeps public homepage unchanged until draft is published", async () => {
  repository.getDraft.mockResolvedValue(draftWithTitle("Draft title"));
  repository.getPublished.mockResolvedValue(
    revisionWithTitle("Published title"),
  );
  expect(
    (await useCase.getPublic("vi")).homepage.copy.landing.hero.titlePrefix
      .content,
  ).toBe("Published title");
});
```

- [ ] **Step 2: Remove postMessage contracts and route**

Run `rg "HomepagePreviewMessage|isHomepagePreviewMessage|preview/homepage|previewSite|site-settings/preview"` first. Remove all listed consumers, the protected preview controller method, and the corresponding use-case projection method in the same change, then run shared/Web/Admin/API typechecks.

- [ ] **Step 3: Verify revision behavior**

```powershell
pnpm --filter @repo/api test -- website-site-config
pnpm --filter @repo/admin test -- website-config.service
```

Expected: public remains published-only; draft endpoint returns the styled draft.

---

### Task 8: Full verification and manual acceptance

**Files:**

- Modify only files required to address verification failures.

- [ ] **Step 1: Check formatting and unintended generated files**

```powershell
git diff --check
git status --short
```

If `apps/admin/next-env.d.ts` or `apps/web/next-env.d.ts` changed only due `next typegen`, restore their tracked content with `apply_patch`; do not use destructive Git reset commands.

- [ ] **Step 2: Run focused tests**

```powershell
pnpm exec tsx --test ../../packages/shared/tests/website-homepage.test.ts
pnpm --filter @repo/homepage test
pnpm --filter @repo/api test -- website-config-policy.service.spec.ts website-site-config
pnpm --filter @repo/admin test -- homepage-puck website-config.service
pnpm --filter @repo/web test -- homepage-renderer.test.mjs
```

- [ ] **Step 3: Run typechecks**

```powershell
pnpm --filter @repo/shared build
pnpm --filter @repo/homepage check-types
pnpm --filter @repo/api check-types
pnpm --filter @repo/admin check-types
pnpm --filter @repo/web check-types
```

- [ ] **Step 4: Run lint and production builds**

```powershell
pnpm --filter @repo/homepage lint
pnpm --filter @repo/api lint
pnpm --filter @repo/admin lint
pnpm --filter @repo/web lint
pnpm --filter @repo/admin build
pnpm --filter @repo/web build
```

- [ ] **Step 5: Perform manual acceptance**

1. Open `http://localhost:4102/vi/website-config/site` and select **Trang chủ**.
2. Click Hero title directly and change its content.
3. Set it to primary color, centered, bold, and `2XL`; verify canvas updates immediately.
4. Switch among 1440, 768, and 390 pixel viewports.
5. Verify add/delete/duplicate/drag actions are unavailable.
6. Reload `http://localhost:4101/vi` before saving/publishing and verify public content is unchanged.
7. Save draft, reload public Web, and verify it remains unchanged.
8. Publish, reload public Web, and verify the new text/style appears.
9. Switch to English in Admin and verify VI/EN drafts remain independent.
10. Log in with view-only permission and verify selection works but editing is disabled.

- [ ] **Step 6: Report verification evidence**

List exact passing commands, any skipped command with reason, migration impact (`none` for styled JSON), and manual acceptance results. Do not claim completion if public draft isolation or locked section structure fails.
