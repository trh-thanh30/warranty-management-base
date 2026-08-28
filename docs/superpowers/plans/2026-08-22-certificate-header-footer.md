# Certificate Header and Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve A4 certificate header/footer readability and replace duplicated footer copy with warranty lookup information.

**Architecture:** Keep the existing Handlebars template and repeated `thead`/`tfoot` pagination structure. Change only template copy, visual sizing, and the embedded logo asset; keep the view model and certificate business logic unchanged.

**Tech Stack:** NestJS, TypeScript, Handlebars, HTML/CSS, Chromium PDF, Vitest/Jest-style assertions.

## Global Constraints

- Execute inline and sequentially; do not use subagents or parallel tasks.
- Do not commit without explicit user permission.
- Do not change API, database, email flow, certificate identifiers, or warranty rules.
- Footer lookup URL is `baohanh.lexzenz.com/tra-cuu`.
- Preserve repeated header/footer behavior on every A4 page.

---

### Task 1: Lock footer copy with a failing template test

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`

**Interfaces:**

- Consumes: `WarrantyCertificateHtmlTemplateService.render(model)`.
- Produces: Regression assertions for new footer content and removal of duplicated copy.

- [ ] **Step 1: Replace old footer assertions**

Assert that rendered HTML contains:

```ts
expect(html).toContain("TRA CỨU BẢO HÀNH ĐIỆN TỬ");
expect(html).toContain("Kiểm tra hiệu lực và thời hạn bảo hành tại");
expect(html).toContain("baohanh.lexzenz.com/tra-cuu");
expect(html).toContain("Ngày cấp: 20/8/2026");
expect(html).toContain("Mã chứng nhận:");
expect(html).toContain("CERT-2026-001");
expect(html).not.toContain(
  "Chứng nhận được phát hành tự động bởi hệ thống E-Warranty.",
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm --filter @repo/api test -- warranty-certificate-html-template.service.spec.ts
```

Expected: failure because the footer still renders the old copy.

---

### Task 2: Implement footer structure and header/footer sizing

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.html`
- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.css`
- Modify: `apps/api/src/modules/warranty-certificates/templates/assets/brand-logo.png` only if a lossless trim is available without changing logo proportions.

**Interfaces:**

- Consumes: existing `certificate.issuedAt`, `certificate.number`, and `brandLogoDataUrl` template fields.
- Produces: the same self-contained HTML interface consumed by `WarrantyCertificatePdfService`.

- [ ] **Step 1: Replace footer copy**

Use this semantic structure inside `.certificate-footer__content`:

```html
<div class="certificate-footer__copy">
  <strong>TRA CỨU BẢO HÀNH ĐIỆN TỬ</strong>
  <p>Kiểm tra hiệu lực và thời hạn bảo hành tại</p>
  <span class="certificate-footer__url">baohanh.lexzenz.com/tra-cuu</span>
</div>
<div class="certificate-footer__meta">
  <span>Ngày cấp: <strong>{{certificate.issuedAt}}</strong></span>
  <span>Mã chứng nhận: <strong>{{certificate.number}}</strong></span>
</div>
```

- [ ] **Step 2: Increase visual hierarchy without absolute positioning**

Apply these target values, adjusting only if the A4 preview gains an unintended page:

```css
.certificate-page-header {
  min-height: 18mm;
}

.certificate-page-header__logo {
  width: 50mm;
  max-height: 10mm;
}

.certificate-page-header__meta span {
  font-size: 8px;
}

.certificate-page-header__meta strong {
  font-size: 10px;
}

.certificate-footer__content {
  grid-template-columns: 44mm 1fr auto;
  min-height: 25mm;
}

.certificate-footer__logo {
  width: 44mm;
  max-height: 9mm;
}

.certificate-footer__copy strong {
  font-size: 9px;
}

.certificate-footer__url,
.certificate-footer__meta strong {
  color: var(--ink);
  font-size: 9px;
  font-weight: 700;
}
```

- [ ] **Step 3: Run focused template tests and verify GREEN**

Run:

```bash
pnpm --filter @repo/api test -- warranty-certificate-html-template.service.spec.ts
```

Expected: all tests in the file pass.

---

### Task 3: Verify A4 pagination and regressions

**Files:**

- Modify only if required by test evidence: `apps/api/src/modules/warranty-certificates/templates/certificate.css`

**Interfaces:**

- Consumes: existing `certificate:preview` cases `single`, `double`, and `long`.
- Produces: verified one-page normal certificates and readable repeated header/footer on long certificates.

- [ ] **Step 1: Generate previews**

Run:

```bash
pnpm --filter @repo/api certificate:preview
```

Inspect:

```text
http://127.0.0.1:4300/?case=single&format=pdf
http://127.0.0.1:4300/?case=double&format=pdf
http://127.0.0.1:4300/?case=long&format=pdf
```

Expected:

- `single` and `double` remain one page when their body fits A4.
- `long` may span pages, with header/footer repeated and no overlap.
- Footer URL, date, and certificate number remain readable at 100% zoom.

- [ ] **Step 2: Run certificate regression tests**

Run:

```bash
pnpm --filter @repo/api test -- warranty-certificate
pnpm --filter @repo/api check-types
pnpm exec prettier --check apps/api/src/modules/warranty-certificates/templates/certificate.html apps/api/src/modules/warranty-certificates/templates/certificate.css apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts
git diff --check
```

Expected: all commands pass with no type, formatting, or whitespace errors.
