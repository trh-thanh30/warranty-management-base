# Certificate A4 Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Work inline and sequentially; do not dispatch subagents.

**Goal:** Remove product-count-based PDF layout decisions and make every generated certificate paginate naturally as A4 pages with a compact repeated header and footer while keeping the hero exclusive to page one.

**Architecture:** Convert the certificate root into a print-oriented document table. The table `thead` and `tfoot` provide deterministic repeated page chrome in Chromium, while the `tbody` contains the one-time hero and all dynamic certificate data. Product rows and activation-field cards remain atomic with `break-inside: avoid`; Chromium decides page boundaries without application-level product or field thresholds.

**Tech Stack:** NestJS, TypeScript, Handlebars, HTML/CSS paged media, Puppeteer/Chromium, Jest, pdf-lib.

## Global Constraints

- Do not introduce a new PDF or pagination dependency.
- Do not calculate page layout from `products.length` or `activationFields.length`.
- Do not use `position: absolute` or `position: fixed` for the certificate footer.
- The compact page header and footer repeat on every physical A4 page; the large hero appears only once on page one.
- Preserve every product and activation field; no truncation or hidden overflow.
- Preserve embedded fonts and embedded image data URLs.
- Do not change certificate business data, certificate issuance, storage, email attachment, API contracts, database schema, migrations, or seed data.
- Work inline and sequentially. Do not commit until the user explicitly approves a commit.

---

## File Map

- Modify `apps/api/src/modules/warranty-certificates/templates/certificate.html`: add the paged document table, repeated compact header/footer, and semantic classes for nested product data.
- Modify `apps/api/src/modules/warranty-certificates/templates/certificate.css`: scope table rules, define A4 page chrome, remove compact/continuation heuristics, and preserve row-level page-break protection.
- Modify `apps/api/src/modules/warranty-certificates/services/warranty-certificate-html-template.service.ts`: remove `compactFooter` and `activationFieldsContinuation` from the template context.
- Modify `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`: specify invariant HTML structure for one, two, and long dynamic datasets.
- Modify `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-pdf.service.spec.ts`: verify one-page and multi-page Chromium rendering still work.
- Modify `apps/api/scripts/preview-warranty-certificate.ts`: provide explicit `single`, `double`, and `long` preview datasets for visual print QA.

---

### Task 1: Lock the pagination contract with failing template tests

**Files:**

- Test: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`

**Interfaces:**

- Consumes: `WarrantyCertificateHtmlTemplateService.render(viewModel)`.
- Produces: an HTML contract using `certificate-document`, `certificate-page-header`, `certificate-page-body`, `product-table`, and `certificate-page-footer` without count-dependent classes.

- [ ] **Step 1: Replace compact-footer assertions with page-layout assertions**

Update the short-certificate test to assert the structural contract:

```ts
expect(html).toContain('class="certificate-document"');
expect(html).toContain('class="certificate-page-header"');
expect(html).toContain('class="certificate-page-body"');
expect(html).toContain('class="product-table"');
expect(html).toContain('class="certificate-page-footer"');
expect(html).not.toContain("certificate--compact");
expect(html).not.toContain("continuation-header");
expect(html).not.toContain("section--continuation");
```

- [ ] **Step 2: Add a two-product regression test**

Create a second product from the existing fixture and verify the rendered HTML uses the exact same page structure as the one-product certificate:

```ts
it("uses the same natural A4 layout for two products", () => {
  const product = model.products[0];
  const html = new WarrantyCertificateHtmlTemplateService().render({
    ...model,
    products: [
      product,
      {
        ...product,
        positionLabel: "Kính sườn trước - trái",
        productCode: "PRD-002",
        warrantyCode: "WM-2026-002",
      },
    ],
  });

  expect(html).toContain('class="certificate-document"');
  expect(html).toContain('class="certificate-page-header"');
  expect(html).toContain('class="certificate-page-footer"');
  expect(html).not.toContain("certificate--compact");
  expect(html).not.toContain("section--continuation");
});
```

- [ ] **Step 3: Replace the six-product continuation test**

Keep the six-product/six-field data, but assert all data remains present and no manually forced continuation section is emitted:

```ts
expect(html).toContain("Vị trí 1");
expect(html).toContain("Vị trí 6");
expect(html).toContain("Sản phẩm 1");
expect(html).toContain("Sản phẩm 6");
expect(html).not.toContain("continuation-header");
expect(html).not.toContain("section--continuation");
```

- [ ] **Step 4: Run the focused test and confirm RED**

Run:

```cmd
pnpm --filter @repo/api exec jest modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts --runInBand
```

Expected: FAIL because the current template still renders `certificate--compact`, has no document-level page table, and manually inserts `section--continuation`.

---

### Task 2: Remove count-dependent decisions from the template service

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/services/warranty-certificate-html-template.service.ts`

**Interfaces:**

- Consumes: `WarrantyCertificateViewModel`.
- Produces: `WarrantyCertificateTemplateContext` containing only view-model data plus embedded template assets and styles.

- [ ] **Step 1: Remove pagination booleans from the context type**

Change the context type to:

```ts
type WarrantyCertificateTemplateContext = WarrantyCertificateViewModel & {
  brandLogoDataUrl: string;
  fontFaceStyles: string;
  vehicleHeroDataUrl: string;
  styles: string;
};
```

- [ ] **Step 2: Remove both count-based expressions from `render`**

The render call must become:

```ts
return this.renderTemplate({
  ...viewModel,
  brandLogoDataUrl: this.brandLogoDataUrl,
  fontFaceStyles: this.fontFaceStyles,
  vehicleHeroDataUrl: this.vehicleHeroDataUrl,
  styles: this.styles,
});
```

- [ ] **Step 3: Run typecheck to detect stale Handlebars context usage**

Run:

```cmd
pnpm --filter @repo/api check-types
```

Expected: PASS. Handlebars template keys are runtime strings, so any remaining `compactFooter` or `activationFieldsContinuation` usage must be found with the explicit search in Task 5.

---

### Task 3: Restructure HTML into repeated A4 page chrome

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.html`

**Interfaces:**

- Consumes: existing Handlebars view-model fields and embedded `brandLogoDataUrl`/`vehicleHeroDataUrl`.
- Produces: a print table whose header/footer repeat automatically and whose body remains dynamic.

- [ ] **Step 1: Replace the conditional root class with a stable root**

Use:

```html
<main class="certificate">
  <table class="certificate-document" role="presentation"></table>
</main>
```

- [ ] **Step 2: Move brand and certificate number into a repeated document header**

Place this directly inside `certificate-document`:

```html
<thead class="certificate-document__head">
  <tr>
    <td class="certificate-document__cell">
      <header class="certificate-page-header">
        <img
          class="certificate-page-header__logo"
          src="{{{brandLogoDataUrl}}}"
          alt="FUJITEK và LEXZENZ"
        />
        <div class="certificate-page-header__meta">
          <span>Chi tiết chứng nhận</span>
          <strong>{{certificate.number}}</strong>
        </div>
      </header>
    </td>
  </tr>
</thead>
```

This is the only brand/number header. Remove `hero__brand`, `hero__logo-frame`, `hero__logo`, `hero__number`, and `hero__number-label` from the hero.

- [ ] **Step 3: Wrap one-time content in the table body**

Open the body before the hero and close it after the activation-fields section:

```html
<tbody class="certificate-document__body">
  <tr>
    <td class="certificate-document__cell">
      <div class="certificate-page-body">
        <!-- hero, summary, products, activation fields -->
      </div>
    </td>
  </tr>
</tbody>
```

Keep the large hero in this body so it appears once on page one.

- [ ] **Step 4: Scope the nested product table**

Change the products table opening tag to:

```html
<table class="product-table"></table>
```

This prevents page-layout table CSS from leaking into product columns.

- [ ] **Step 5: Remove the manually generated continuation header**

Render activation fields as a normal section:

```html
{{#if activationFields.length}}
<section class="section section--fields">
  <div class="section__heading">
    <div>
      <p class="eyebrow">Thông tin bổ sung</p>
      <h2>Thông tin kích hoạt theo danh mục</h2>
    </div>
  </div>
  <dl class="field-grid">
    {{#each activationFields}}
    <div>
      <dt>{{label}}</dt>
      <dd>{{value}}</dd>
    </div>
    {{/each}}
  </dl>
</section>
{{/if}}
```

- [ ] **Step 6: Move the existing footer into a repeated table footer**

Wrap the existing footer markup as:

```html
<tfoot class="certificate-document__foot">
  <tr>
    <td class="certificate-document__cell">
      <footer class="certificate-page-footer">
        <!-- retain current logo, copy, issue date, number and red band -->
      </footer>
    </td>
  </tr>
</tfoot>
```

Rename the existing root footer class from `certificate-footer` to `certificate-page-footer`; child class names can remain unchanged to limit unrelated visual changes.

- [ ] **Step 7: Close the document table and root**

The end of the body must be:

```html
  </table>
</main>
```

---

### Task 4: Implement print CSS without absolute positioning or count thresholds

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.css`

**Interfaces:**

- Consumes: HTML classes introduced in Task 3.
- Produces: repeated header/footer groups and naturally fragmented A4 body content.

- [ ] **Step 1: Add document-table page layout**

Add:

```css
.certificate-document {
  width: 100%;
  min-height: 297mm;
  border: 0;
  border-collapse: collapse;
  table-layout: fixed;
}

.certificate-document__head {
  display: table-header-group;
}

.certificate-document__foot {
  display: table-footer-group;
}

.certificate-document__cell {
  padding: 0;
  border: 0;
}

.certificate-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 18mm;
  padding: 3mm 12mm;
  border-top: 1.2mm solid var(--brand);
  border-bottom: 1px solid var(--line);
  background: #ffffff;
}

.certificate-page-header__logo {
  width: 46mm;
  max-height: 9mm;
  object-fit: contain;
  object-position: left center;
}

.certificate-page-header__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1mm;
  text-transform: uppercase;
}

.certificate-page-header__meta span {
  color: var(--muted);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.certificate-page-header__meta strong {
  color: var(--ink);
  font-size: 9px;
}
```

- [ ] **Step 2: Preserve the current page-one hero without its embedded brand row**

Remove rules for `.hero__brand`, `.hero__logo-frame`, `.hero__logo`, `.hero__number`, `.hero__number-label`, and `.hero__number strong`. Adjust the hero to keep approximately the same combined visual height:

```css
.hero {
  min-height: 64mm;
  padding: 9mm 12mm 12mm;
}
```

Remove the old top-right certificate-number banner from `.hero::before`; retain only decorative red geometry that does not contain text.

- [ ] **Step 3: Scope all data-table selectors to `product-table`**

Replace generic selectors:

```css
table
thead
tr
th,
td
th
th:nth-child(...)
```

with:

```css
.product-table
.product-table thead
.product-table tr
.product-table th,
.product-table td
.product-table th
.product-table th:nth-child(...)
```

Keep:

```css
.product-table thead {
  display: table-header-group;
}

.product-table tr {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

- [ ] **Step 4: Convert footer styles to normal repeated page chrome**

Rename `.certificate-footer` to `.certificate-page-footer`, preserve its visual children, and remove absolute positioning:

```css
.certificate-page-footer {
  color: var(--muted);
  border-top: 1px solid var(--line);
  background: #ffffff;
  font-size: 8px;
}
```

Remove all of:

```css
.certificate--compact
.certificate--compact .certificate-footer
.certificate--compact .certificate-footer__watermark
```

The footer must not have `position: absolute`, `position: fixed`, or count-specific variants.

- [ ] **Step 5: Remove manual continuation CSS**

Delete:

```css
.section--continuation
.continuation-header
.continuation-header__logo
.continuation-header__title
.continuation-header__title span
.continuation-header__title strong
```

- [ ] **Step 6: Keep dynamic blocks atomic where practical**

Retain or add:

```css
.summary__block,
.section__heading,
.product-table tr,
.field-grid > div {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

Do not put `break-inside: avoid` on the entire products section or entire activation-fields section; those containers must be allowed to span pages.

- [ ] **Step 7: Normalize print sizing**

Use:

```css
@media print {
  .certificate {
    width: auto;
    min-height: 297mm;
  }
}
```

Do not restore a special compact mode in print CSS.

---

### Task 5: Make preview cases cover real pagination boundaries

**Files:**

- Modify: `apps/api/scripts/preview-warranty-certificate.ts`

**Interfaces:**

- Consumes: query parameter `case`.
- Produces: reproducible `single`, `double`, and `long` preview documents.

- [ ] **Step 1: Add explicit preview-case resolution**

Introduce:

```ts
function resolvePreviewViewModel(
  previewCase: string | null,
): WarrantyCertificateViewModel {
  if (previewCase === "single") {
    return {
      ...previewViewModel,
      activationFields: previewViewModel.activationFields.slice(0, 1),
      products: previewViewModel.products.slice(0, 1),
    };
  }

  if (previewCase === "double") {
    return {
      ...previewViewModel,
      activationFields: previewViewModel.activationFields.slice(0, 2),
      products: previewViewModel.products.slice(0, 2),
    };
  }

  return {
    ...previewViewModel,
    activationFields: Array.from({ length: 20 }, (_, index) => ({
      label: `Trường ${index + 1}`,
      value: `Giá trị kích hoạt ${index + 1}`,
    })),
    products: Array.from({ length: 45 }, (_, index) => {
      const source =
        previewViewModel.products[index % previewViewModel.products.length];
      return {
        ...source,
        positionLabel: `Vị trí ${index + 1}`,
        productCode: `PRD-${String(index + 1).padStart(3, "0")}`,
        warrantyCode: `WM-2026-${String(index + 1).padStart(3, "0")}`,
      };
    }),
  };
}
```

Use it as:

```ts
const viewModel = resolvePreviewViewModel(requestUrl.searchParams.get("case"));
```

- [ ] **Step 2: Run preview and inspect print mode**

Run:

```cmd
pnpm --filter @repo/api certificate:preview
```

Open and use browser Print Preview:

```text
http://127.0.0.1:4300/?case=single
http://127.0.0.1:4300/?case=double
http://127.0.0.1:4300/?case=long
```

Expected:

- `single`: one A4 page; compact header at top, hero once, footer at bottom.
- `double`: one A4 page if the actual content fits; no large blank area below a prematurely placed footer.
- `long`: multiple A4 pages; every page has the compact header and footer; hero appears only on page one; no product row or activation-field card is cut in half.

---

### Task 6: Complete automated and visual regression verification

**Files:**

- Test: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`
- Test: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-pdf.service.spec.ts`

**Interfaces:**

- Consumes: final HTML template and Chromium renderer.
- Produces: evidence that structure, page count, and existing certificate generation remain valid.

- [ ] **Step 1: Run template tests**

```cmd
pnpm --filter @repo/api exec jest modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run all certificate service tests**

```cmd
pnpm --filter @repo/api exec jest modules/warranty-certificates/tests --runInBand
```

Expected: PASS.

- [ ] **Step 3: Run real Chromium PDF integration tests**

```cmd
pnpm --filter @repo/api exec dotenv -e ../../.env.development -- cross-env RUN_PDF_RENDERER_INTEGRATION=true jest modules/warranty-certificates/tests/warranty-certificate-pdf.service.spec.ts --runInBand
```

Expected:

- Short certificate page count equals `1`.
- Long certificate page count is greater than `1`.
- Every generated buffer begins with `%PDF-`.

- [ ] **Step 4: Run API static verification**

```cmd
pnpm --filter @repo/api check-types
pnpm --filter @repo/api lint
git diff --check
```

Expected: all commands exit with code `0`.

- [ ] **Step 5: Search for removed heuristics**

```cmd
rg -n "compactFooter|certificate--compact|activationFieldsContinuation|section--continuation|continuation-header" apps/api/src/modules/warranty-certificates
```

Expected: no matches.

- [ ] **Step 6: Generate a new certificate through the admin flow**

Restart the API because the template service reads HTML/CSS in its constructor, then create and approve a new activation request. Verify the newly generated PDF rather than reopening an old stored PDF.

- [ ] **Step 7: Stop before committing**

Report changed files, test evidence, and screenshots/observations for `single`, `double`, and `long`. Provide a suggested commit command only after the user approves the result.

---

## Acceptance Criteria

- No PDF layout decision checks the number of products or activation fields.
- One-product and two-product certificates share exactly one layout path.
- Header and footer are rendered as A4 page chrome and repeat on continuation pages.
- The large hero is rendered only on the first page.
- Products and activation fields paginate naturally without lost data or overlapping footer content.
- Product rows and individual activation-field cards are not split across pages.
- Existing embedded font, logo, vehicle image, certificate number, customer data, product data, and activation fields remain intact.
- No schema, migration, seed, API contract, issuance, storage, or email-flow changes are introduced.
- All focused tests, certificate tests, typecheck, lint, and `git diff --check` pass before completion is claimed.
