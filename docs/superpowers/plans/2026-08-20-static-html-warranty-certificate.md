# Static HTML/CSS Warranty Certificate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Execute inline and sequentially. Do not use subagents or parallel tasks.

**Goal:** Replace the existing `pdf-lib` certificate renderer with one static HTML/CSS template rendered by Chromium while preserving the current single-Warranty certificate contract.

**Architecture:** Keep `WarrantyCertificatePdfService.createPdfBuffer()` as the facade used by certificate issuance. Internally normalize its input into a reusable view model, render trusted Handlebars HTML/CSS, and delegate HTML-to-PDF conversion to an internal Puppeteer/Chromium service in production or a local installed browser in development.

**Tech Stack:** NestJS 11, TypeScript 5.9, Handlebars 4.7, Puppeteer Core 24, Chromium, Docker Compose, Jest 30, pnpm 9.

## Global Constraints

- Use one source-controlled HTML/CSS template for every category.
- Do not create template tables, APIs, Admin pages, or Prisma migrations.
- Preserve `WarrantyCertificatePdfInput` and `createPdfBuffer()` for current callers.
- Allow one PDF file to contain multiple A4 pages.
- Do not truncate or discard Product/activation-field rows to force one page.
- Do not create a plain-text or unbranded PDF fallback.
- Escape all domain/customer values and disable JavaScript in Chromium.
- Do not implement request-owned certificate persistence in this plan.
- Run implementation and verification commands sequentially.
- Do not commit until the user explicitly authorizes a commit.

---

## File Structure

### Create

- `packages/api-pdf-renderer/package.json`: production-only internal renderer package.
- `packages/api-pdf-renderer/server.mjs`: internal `/health` and `/render` HTTP server.
- `apps/api/src/config/pdf-renderer.config.ts`: renderer URL, timeout, body limit, and local executable configuration.
- `apps/api/src/modules/warranty-certificates/warranty-certificate.types.ts`: normalized HTML view model.
- `apps/api/src/modules/warranty-certificates/utils/warranty-certificate-view-model.util.ts`: legacy input adapter.
- `apps/api/src/modules/warranty-certificates/services/warranty-certificate-html-template.service.ts`: trusted template and asset loader.
- `apps/api/src/modules/warranty-certificates/services/html-pdf-renderer.service.ts`: renderer HTTP client and local Chromium adapter.
- `apps/api/src/modules/warranty-certificates/templates/certificate.html`: one static Handlebars template.
- `apps/api/src/modules/warranty-certificates/templates/certificate.css`: A4 print layout and pagination.
- `apps/api/src/modules/warranty-certificates/templates/assets/*`: copied brand assets used only by the certificate.
- Focused unit tests for the view-model adapter, template service, and renderer client.

### Modify

- `apps/api/src/modules/warranty-certificates/services/warranty-certificate-pdf.service.ts`: replace `pdf-lib` drawing with composition of the new services.
- `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-pdf.service.spec.ts`: test facade behavior and real PDF output.
- `apps/api/src/modules/warranty-certificates/warranty-certificates.module.ts`: register new services.
- `apps/api/src/config/index.ts`, `apps/api/src/config/env.validation.ts`, and `apps/api/src/app.module.ts`: register PDF renderer configuration.
- `apps/api/nest-cli.json`: copy HTML/CSS/image/font assets.
- `apps/api/package.json` and `pnpm-lock.yaml`: add `puppeteer-core` if the API keeps local fallback support.
- `apps/api/Dockerfile`: build API and PDF renderer artifacts and add `pdf-runner` target.
- `docker-compose.dev.yml` and `docker-compose.prod.yml`: run internal renderer and configure API dependency.
- `.env.example` and `docs/env.md`: document renderer variables.
- Root `package.json`: add renderer image/build helper if needed.

### Retain

- `WarrantyCertificatePdfInput` public shape.
- `IssueWarrantyCertificateUseCase`.
- `WarrantyCertificateEmailQueueService`.
- `WarrantyCertificate` Prisma model and current migration history.

### Remove after migration

- `apps/api/src/modules/warranty-certificates/templates/lexzenz-certificate.pdf`.
- `apps/api/src/modules/warranty-certificates/templates/LiberationSans-Regular.ttf` and `LiberationSans-Bold.ttf` only if the HTML template embeds replacement WOFF2 fonts and no remaining code references them.
- `@pdf-lib/fontkit` and `pdf-lib` only if repository-wide search confirms they have no remaining consumers.

---

### Task 1: Define the normalized certificate view model

**Files:**

- Create: `apps/api/src/modules/warranty-certificates/warranty-certificate.types.ts`
- Create: `apps/api/src/modules/warranty-certificates/utils/warranty-certificate-view-model.util.ts`
- Create: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-view-model.util.spec.ts`
- Modify: `apps/api/src/modules/warranty-certificates/services/warranty-certificate-pdf.service.ts` only to export or relocate `WarrantyCertificatePdfInput` without changing runtime behavior yet.

**Interfaces:**

- Consumes: existing `WarrantyCertificatePdfInput`.
- Produces: `buildWarrantyCertificateViewModel(input): WarrantyCertificateViewModel`.
- Later phases may construct `WarrantyCertificateViewModel` directly with multiple Products.

- [ ] **Step 1: Write failing adapter tests**

Cover:

```ts
expect(buildWarrantyCertificateViewModel(input)).toMatchObject({
  certificate: { number: "CERT-2026-001" },
  products: [
    expect.objectContaining({
      productName: "Phim cách nhiệt ô tô B",
      warrantyCode: "WM-2026-001",
    }),
  ],
  activationFields: [
    { label: "Kính lái", value: "SP50" },
    { label: "Kính lưng", value: "SR10" },
  ],
});
```

Add separate assertions that blank values are omitted and an unknown key such
as `sunroof` remains visible with fallback label `sunroof`.

- [ ] **Step 2: Run the focused test and verify RED**

```cmd
pnpm --filter @repo/api test -- warranty-certificate-view-model.util.spec.ts
```

Expected: FAIL because the view-model builder does not exist.

- [ ] **Step 3: Add the exact view-model types**

Define `WarrantyCertificateViewModel`, `WarrantyCertificateProductRow`, and
`WarrantyCertificateFieldRow` matching the approved design. Store dates as
already formatted display strings so the HTML template performs no business
formatting.

- [ ] **Step 4: Implement the pure adapter**

Use the existing date/display helpers and a deterministic label map:

```ts
const FILM_FIELD_LABELS: Record<string, string> = {
  windshield: "Kính lái",
  frontLeftSide: "Kính sườn trước - trái",
  frontRightSide: "Kính sườn trước - phải",
  rearLeftSide: "Kính sườn sau - trái",
  rearRightSide: "Kính sườn sau - phải",
  rearGlass: "Kính lưng",
};
```

Return `'-'` for optional scalar values, but omit activation-field rows whose
trimmed value is empty.

- [ ] **Step 5: Run tests and typecheck**

```cmd
pnpm --filter @repo/api test -- warranty-certificate-view-model.util.spec.ts
pnpm --filter @repo/api check-types
```

Expected: both commands exit 0.

---

### Task 2: Render the static HTML/CSS template safely

**Files:**

- Create: `apps/api/src/modules/warranty-certificates/templates/certificate.html`
- Create: `apps/api/src/modules/warranty-certificates/templates/certificate.css`
- Create: `apps/api/src/modules/warranty-certificates/templates/assets/*`
- Create: `apps/api/src/modules/warranty-certificates/services/warranty-certificate-html-template.service.ts`
- Create: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`
- Modify: `apps/api/nest-cli.json`

**Interfaces:**

- Consumes: `WarrantyCertificateViewModel`.
- Produces: `render(viewModel): string`, returning a complete self-contained HTML document.

- [ ] **Step 1: Write failing HTML rendering tests**

Assert that rendered HTML:

- Contains certificate, customer, Product, Warranty and dynamic-field values.
- Escapes `<script>alert(1)</script>` to text.
- Contains the CSS inside a `<style>` block.
- Contains local images as `data:image/...;base64,...`.
- Does not contain `http://`, `https://`, `<script`, or triple-brace output.

- [ ] **Step 2: Run the focused test and verify RED**

```cmd
pnpm --filter @repo/api test -- warranty-certificate-html-template.service.spec.ts
```

Expected: FAIL because the template service does not exist.

- [ ] **Step 3: Create the static template**

Use normal Handlebars interpolation and loops:

```hbs
{{#each products}}
  <tr class="product-row">
    <td>{{positionLabel}}</td>
    <td>{{productName}}</td>
    <td>{{productCode}}</td>
    <td>{{serialNumber}}</td>
    <td>{{warrantyCode}}</td>
    <td>{{expiryDate}}</td>
  </tr>
{{/each}}
```

```hbs
{{#each activationFields}}
  <div class="field-row">
    <span class="field-label">{{label}}</span>
    <strong class="field-value">{{value}}</strong>
  </div>
{{/each}}
```

- [ ] **Step 4: Add print and pagination CSS**

Required rules:

```css
@page {
  size: A4 portrait;
  margin: 0;
}
html,
body {
  margin: 0;
  padding: 0;
}
.certificate-page {
  width: 210mm;
  min-height: 297mm;
}
thead {
  display: table-header-group;
}
tfoot {
  display: table-footer-group;
}
tr,
.product-row,
.field-row {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

Do not use fixed absolute coordinates for data rows.

- [ ] **Step 5: Implement template loading and asset embedding**

Load each trusted file once and cache the compiled Handlebars template. Replace
asset placeholders with data URLs before compiling. Throw
`WARRANTY_CERTIFICATE_TEMPLATE_ASSET_NOT_FOUND:<filename>` when a required file
is absent.

- [ ] **Step 6: Update Nest assets**

Add HTML, CSS, PNG/JPG and WOFF2 patterns to `apps/api/nest-cli.json` and verify
the files appear under `apps/api/dist/modules/warranty-certificates/templates`
after build.

- [ ] **Step 7: Run focused tests and build**

```cmd
pnpm --filter @repo/api test -- warranty-certificate-html-template.service.spec.ts
pnpm --filter @repo/api build
```

Expected: tests pass and compiled assets exist in `dist`.

---

### Task 3: Add the HTML-to-PDF renderer adapter

**Files:**

- Create: `apps/api/src/config/pdf-renderer.config.ts`
- Create: `apps/api/src/modules/warranty-certificates/services/html-pdf-renderer.service.ts`
- Create: `apps/api/src/modules/warranty-certificates/tests/html-pdf-renderer.service.spec.ts`
- Modify: `apps/api/src/config/index.ts`
- Modify: `apps/api/src/config/env.validation.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Produces: `createPdf(html: string): Promise<Buffer>`.
- Uses `PDF_RENDERER_URL` when configured.
- Uses configured/detected local Chromium only when the URL is absent.

- [ ] **Step 1: Write failing remote-renderer tests**

Mock `fetch` and assert:

```ts
expect(fetch).toHaveBeenCalledWith("http://pdf-renderer:3001/render", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ html }),
  signal: expect.any(AbortSignal),
});
```

Test a PDF response, non-2xx response, empty response, and timeout.

- [ ] **Step 2: Run the focused test and verify RED**

```cmd
pnpm --filter @repo/api test -- html-pdf-renderer.service.spec.ts
```

- [ ] **Step 3: Add validated configuration**

Add:

```text
PDF_RENDERER_URL           optional URL
PUPPETEER_EXECUTABLE_PATH optional path
PDF_RENDER_TIMEOUT_MS     positive integer, default 45000
PDF_MAX_BODY_BYTES        positive integer, default 10485760
```

Register `pdfRendererConfig` in `ConfigModule`.

- [ ] **Step 4: Implement the remote adapter**

Reject HTML larger than `PDF_MAX_BODY_BYTES`, use `AbortSignal.timeout`, require
`application/pdf` or a `%PDF-` prefix, and include the remote response body in a
bounded diagnostic error.

- [ ] **Step 5: Add local development fallback**

Add `puppeteer-core`. Resolve configured path first, then common Linux Chromium,
Windows Chrome and Windows Edge paths. Disable JavaScript before `setContent`,
wait for fonts, print backgrounds, and close the page/browser in `finally`.

- [ ] **Step 6: Run tests, typecheck and lint**

```cmd
pnpm --filter @repo/api test -- html-pdf-renderer.service.spec.ts
pnpm --filter @repo/api check-types
pnpm --filter @repo/api lint
```

---

### Task 4: Replace the current pdf-lib facade implementation

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/services/warranty-certificate-pdf.service.ts`
- Modify: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-pdf.service.spec.ts`
- Modify: `apps/api/src/modules/warranty-certificates/warranty-certificates.module.ts`
- Verify: `apps/api/src/modules/warranty-certificates/use-cases/issue-warranty-certificate.use-case.ts`
- Verify: `apps/api/src/modules/warranty-certificates/tests/issue-warranty-certificate.use-case.spec.ts`

**Interfaces:**

- Retains: `createPdfBuffer(input: WarrantyCertificatePdfInput): Promise<Buffer>`.
- Delegates to the view-model builder, HTML template service, and renderer.

- [ ] **Step 1: Replace coordinate-specific tests with composition tests**

Mock the template and renderer ports. Assert the facade passes a normalized
view model into the template and the resulting HTML into the renderer.

- [ ] **Step 2: Run the focused tests and verify RED**

```cmd
pnpm --filter @repo/api test -- warranty-certificate-pdf.service.spec.ts
```

- [ ] **Step 3: Implement the minimal facade**

```ts
async createPdfBuffer(input: WarrantyCertificatePdfInput) {
  const model = buildWarrantyCertificateViewModel(input);
  const html = this.htmlTemplate.render(model);
  return this.htmlPdfRenderer.createPdf(html);
}
```

Remove all PDF coordinates, font fitting, `PDFDocument`, `fontkit`, and direct
PDF-template reads from this service.

- [ ] **Step 4: Register providers and run regressions**

```cmd
pnpm --filter @repo/api test -- warranty-certificate-pdf.service.spec.ts issue-warranty-certificate.use-case.spec.ts warranty-certificate-email-queue.service.spec.ts
pnpm --filter @repo/api check-types
```

Expected: callers remain unchanged and tests pass.

- [ ] **Step 5: Remove obsolete dependencies only after reference audit**

```cmd
rg -n "pdf-lib|@pdf-lib/fontkit|lexzenz-certificate.pdf|LiberationSans" apps packages
```

Only remove a dependency or asset when this command shows no remaining valid
consumer.

---

### Task 5: Add the isolated production PDF renderer

**Files:**

- Create: `packages/api-pdf-renderer/package.json`
- Create: `packages/api-pdf-renderer/server.mjs`
- Modify: `apps/api/Dockerfile`
- Modify: root `package.json`

**Interfaces:**

- `GET /health` returns `200 {"status":"ok"}`.
- `POST /render` accepts `{ html: string }` and returns `application/pdf`.
- Keeps one Chromium browser and one page per request.

- [ ] **Step 1: Create the renderer package**

Use `puppeteer-core` as the only runtime dependency. The package exposes
`pnpm start` and includes `server.mjs` in production deploy output.

- [ ] **Step 2: Implement bounded HTTP handling**

The server must:

- Reject bodies above `PDF_MAX_BODY_BYTES` with 413.
- Reject invalid JSON or missing HTML with 400.
- Disable page JavaScript.
- Set a 30-second content timeout.
- Wait for `document.fonts.ready`.
- Use `preferCSSPageSize: true` and `printBackground: true`.
- Close each page in `finally`.
- Reset the cached browser promise on disconnect.
- Close browser/server on SIGTERM and SIGINT.

- [ ] **Step 3: Extend the API Dockerfile**

Prune/deploy `@repo/api-pdf-renderer`, then add target `pdf-runner` installing:

```text
chromium nss freetype harfbuzz ca-certificates ttf-freefont
```

Run the renderer as a non-root user and expose port 3001.

- [ ] **Step 4: Add build helper and validate Dockerfile**

Add `docker:build:pdf-renderer` and include it in `docker:build:all`.

```cmd
pnpm install
pnpm docker:check:api
docker build -f apps/api/Dockerfile --target pdf-runner -t warranty-management-base-api-pdf-renderer:dev .
```

Expected: package lock updates once and the image builds successfully.

---

### Task 6: Wire development and production Compose

**Files:**

- Modify: `docker-compose.dev.yml`
- Modify: `docker-compose.prod.yml`
- Modify: `.env.example`
- Modify: `docs/env.md`

**Interfaces:**

- API uses `http://pdf-renderer:3001` inside Compose.
- Renderer is internal-only and has a healthcheck.

- [ ] **Step 1: Add `pdf-renderer` to development Compose**

Build the `pdf-runner` target, set Chromium/body-limit environment variables,
expose port 3001 only to the Compose network, and add a `/health` healthcheck.

- [ ] **Step 2: Make development API depend on renderer health**

Set `PDF_RENDERER_URL=http://pdf-renderer:3001` and add the healthy dependency.
Update `infra:dev:up` to include `pdf-renderer` so the documented command starts
all required rendering infrastructure.

- [ ] **Step 3: Add production renderer service**

Use a separately tagged PDF image, internal `expose`, restart policy,
healthcheck, body limit, and API healthy dependency. Do not add a public host
port.

- [ ] **Step 4: Validate Compose configurations**

```cmd
pnpm infra:dev:config
pnpm infra:prod:config
```

Expected: both commands exit 0 and resolved API environment contains the
internal renderer URL.

- [ ] **Step 5: Document local non-Docker behavior**

Document that developers running `pnpm dev:api` can either start the renderer
container and set `PDF_RENDERER_URL`, or set `PUPPETEER_EXECUTABLE_PATH` to an
installed Chrome/Edge executable.

---

### Task 7: Integration, pagination and full verification

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-pdf.service.spec.ts`
- Add or modify only fixtures required by the renderer integration test.

- [ ] **Step 1: Add a short real-render integration fixture**

Render Vietnamese customer and Product data through Chromium. Assert:

```ts
expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
expect((await PDFDocument.load(pdf)).getPageCount()).toBe(1);
```

`pdf-lib` may remain as a test-only parser if no lighter existing parser is
available; it must not render production certificates.

- [ ] **Step 2: Add a multi-page fixture**

Create enough Product and activation-field rows to exceed one A4 page. Assert
the parsed PDF page count is greater than one and the rendered HTML contains the
first and last row before conversion.

- [ ] **Step 3: Run focused integration tests with renderer available**

```cmd
docker compose -f docker-compose.dev.yml --env-file .env.development up -d pdf-renderer
pnpm --filter @repo/api test -- warranty-certificate-pdf.service.spec.ts
```

Expected: short and multi-page fixtures pass.

- [ ] **Step 4: Run API verification sequentially**

```cmd
pnpm --filter @repo/api test
pnpm --filter @repo/api check-types
pnpm --filter @repo/api lint
pnpm --filter @repo/api build
git diff --check
```

Record existing lint warnings separately; do not weaken new assertions.

- [ ] **Step 5: Manual certificate flow**

1. Activate one existing eligible Warranty.
2. Confirm one `WarrantyCertificate` record is created.
3. View/download the generated PDF.
4. Confirm branded HTML/CSS layout, Vietnamese text and printed backgrounds.
5. Confirm email contains the same single PDF attachment.
6. Force the renderer unavailable and confirm issuance records failure rather
   than producing a plain-text certificate.
7. Restore the renderer and retry issuance/resend according to the existing
   certificate lifecycle.

- [ ] **Step 6: Audit scope**

```cmd
git status --short
git diff --stat
git diff --check
```

Expected scope: renderer package, API template/renderer services, configuration,
Docker/Compose, tests and documentation only. No Prisma, Admin, category, Product
or request-owned certificate changes belong in this phase.

---

## Next Phase

After this renderer is verified, implement request-owned certificates by
building a multi-Product `WarrantyCertificateViewModel` and passing it to the
same HTML template and HTML-to-PDF renderer. That phase owns persistence,
request-level API actions, email lifecycle and Admin changes; it must not create
another PDF renderer or duplicate the template.
