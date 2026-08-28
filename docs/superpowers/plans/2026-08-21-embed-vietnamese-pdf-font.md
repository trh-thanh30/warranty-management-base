# Embedded Vietnamese PDF Font Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute inline with test-driven development; do not use parallel agents.

**Goal:** Make warranty certificate typography deterministic and fully compatible with Vietnamese glyphs in local and production PDF rendering.

**Architecture:** Install `@fontsource/be-vietnam-pro` in the API, resolve its Vietnamese WOFF2 assets at runtime, encode them as data URLs, and inject `@font-face` declarations into the self-contained certificate HTML. Puppeteer already waits for `document.fonts.ready`, so no renderer lifecycle change is needed.

**Tech Stack:** NestJS, Handlebars, Puppeteer, Fontsource, Jest.

## Global Constraints

- Do not load fonts from a CDN or external URL.
- Preserve the existing certificate data model and PDF business flow.
- Support weights 400, 600, 700, and 800.
- Do not commit without explicit user authorization.

---

### Task 1: Embed Be Vietnam Pro in certificate HTML

**Files:**

- Modify: `apps/api/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/api/src/modules/warranty-certificates/services/warranty-certificate-html-template.service.ts`
- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.html`
- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.css`
- Test: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`

- [ ] Add a failing assertion that rendered HTML contains embedded WOFF2 data URLs and Be Vietnam Pro font declarations.
- [ ] Run the focused Jest test and verify it fails because the font is not embedded.
- [ ] Install `@fontsource/be-vietnam-pro@5.3.0` as an API dependency.
- [ ] Resolve and Base64-encode Vietnamese WOFF2 files for weights 400, 600, 700, and 800.
- [ ] Inject the generated `@font-face` declarations into the certificate `<style>` element.
- [ ] Use `Be Vietnam Pro` as the certificate font family and reduce eyebrow tracking to avoid separating Vietnamese diacritics visually.
- [ ] Run focused certificate tests, API typecheck, and API lint.
