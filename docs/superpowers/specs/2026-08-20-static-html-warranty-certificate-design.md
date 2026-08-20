# Static HTML/CSS Warranty Certificate Design

**Status:** Approved for implementation planning on 2026-08-20.

## 1. Goal

Replace the current `pdf-lib` coordinate-based warranty certificate renderer
with one source-controlled HTML/CSS template rendered by Chromium.

This phase changes the renderer used by the existing single-Warranty
certificate flow. It establishes a reusable document model that the later
request-owned, multi-Product certificate phase can consume without introducing
request-certificate persistence in this phase.

## 2. Current State

`WarrantyCertificatePdfService` currently:

- Loads `lexzenz-certificate.pdf` as a fixed background.
- Loads a bundled TTF font.
- Draws values at hard-coded PDF coordinates with `pdf-lib`.
- Knows Film-specific keys such as `windshield` and `rearGlass`.
- Truncates values to the available coordinate width.
- Requires exactly one PDF page.

The repository already uses Handlebars for email templates, but it does not
have Chromium, Puppeteer, an HTML certificate template, or a PDF renderer
service.

## 3. Decisions

### 3.1 One source-controlled template

The system uses exactly one shared template:

```text
apps/api/src/modules/warranty-certificates/templates/
├── certificate.html
├── certificate.css
└── assets/
    ├── lexzenz-logo.png
    ├── fujitek-logo.png
    └── certificate-hero.png
```

Administrators cannot edit, upload, select, or version templates. A template
change is a source-code change and requires deployment.

### 3.2 Dynamic data, static layout

The template receives normalized arrays instead of knowing category-specific
field keys. It loops over `products` and `activationFields`.

```ts
export type WarrantyCertificateViewModel = {
  certificate: {
    installedAt: string;
    number: string;
    issuedAt: string;
  };
  customer: {
    address: string;
    email: string;
    fullName: string;
    phone: string;
  };
  dealer: {
    name: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
  products: Array<{
    durationLabel: string;
    expiryDate: string;
    positionLabel: string;
    productCode: string;
    productName: string;
    serialNumber: string;
    warrantyCode: string;
  }>;
  activationFields: Array<{
    label: string;
    value: string;
  }>;
};
```

The existing single-Warranty adapter creates a one-element `products` array.
The later request-owned certificate flow will provide multiple elements and
the actual category activation-field labels.

### 3.3 Automatic pagination

The output is one PDF file containing as many A4 pages as required.

- The first page contains the certificate identity and customer summary.
- Product rows and activation fields avoid splitting inside a row.
- Table headers repeat on continuation pages where Chromium supports repeated
  table headers.
- Additional pages are allowed; data must never be silently truncated to keep
  the document on one page.
- `page.pdf()` uses `printBackground: true` and `preferCSSPageSize: true`.

### 3.4 Renderer isolation

Production follows the proven ecommerce-base pattern:

```text
API --POST /render--> internal pdf-renderer --Puppeteer--> Chromium
```

The renderer is an internal container and is not exposed publicly. It keeps one
browser process and creates one page per render request.

For local API development without `PDF_RENDERER_URL`, the API may launch an
installed Chrome/Edge/Chromium executable through `puppeteer-core`. Production
must use the internal renderer service.

### 3.5 No degraded PDF fallback

Unlike ecommerce-base invoices, certificates do not fall back to a plain-text
PDF because that would remove the approved branding and structure. A renderer
failure is propagated to the existing certificate issuance lifecycle, which
records a failed certificate and allows retry.

## 4. Architecture

```text
IssueWarrantyCertificateUseCase
        |
        v
WarrantyCertificatePdfService (existing public facade)
        |
        +--> WarrantyCertificateViewModelBuilder
        |
        +--> WarrantyCertificateHtmlTemplateService
        |       - loads certificate.html and certificate.css
        |       - embeds local images/fonts as data URLs
        |       - renders escaped Handlebars variables
        |
        +--> HtmlPdfRenderer
                - calls PDF_RENDERER_URL when configured
                - local Chromium fallback in development
```

`IssueWarrantyCertificateUseCase` continues calling:

```ts
createPdfBuffer(input: WarrantyCertificatePdfInput): Promise<Buffer>
```

No caller, controller, database table, email queue, storage flow, or Admin UI
contract changes in this phase.

## 5. Template Safety

- Handlebars escapes interpolated values by default.
- The template does not use triple-brace interpolation for domain data.
- No user-provided HTML, CSS, JavaScript, or URL is accepted.
- Images and fonts are read from trusted repository files and embedded as data
  URLs before sending HTML to the renderer.
- JavaScript is disabled on the Chromium page before setting content.
- The renderer accepts only a non-empty HTML string and enforces body-size and
  render time limits.
- The production renderer is reachable only on the internal Docker network.

## 6. Static Assets and Build Output

Approved brand assets are copied into the API certificate template folder so
the API does not import files from `apps/web` or `apps/admin`.

Nest build assets include:

- `**/*.html`
- `**/*.css`
- `**/*.png`
- `**/*.jpg`
- `**/*.woff2`

The template loader resolves both source and compiled `dist` paths and fails
with a descriptive error when an asset is missing.

## 7. Existing Input Compatibility

The current `WarrantyCertificatePdfInput` remains unchanged during this phase.

Known Film keys are adapted to display labels in a deterministic order:

```text
windshield      -> Kính lái
frontLeftSide   -> Kính sườn trước - trái
frontRightSide  -> Kính sườn trước - phải
rearLeftSide    -> Kính sườn sau - trái
rearRightSide   -> Kính sườn sau - phải
rearGlass       -> Kính lưng
```

Blank values are omitted from `activationFields`. Unknown keys are retained
using the key as a fallback label so data is not dropped. The later aggregate
flow passes configured labels directly and does not rely on this compatibility
mapping.

## 8. Deployment

Create workspace package `@repo/api-pdf-renderer` containing the small internal
HTTP server and `puppeteer-core` dependency.

Add Docker target `pdf-runner` with Alpine Chromium and fonts. Add a
`pdf-renderer` service to development and production compose files. The API
receives:

```text
PDF_RENDERER_URL=http://pdf-renderer:3001
```

Environment validation also supports:

```text
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
PDF_RENDER_TIMEOUT_MS=45000
PDF_MAX_BODY_BYTES=10485760
```

No Prisma migration is required for this phase.

## 9. Testing

### Unit tests

- Build one Product row from the legacy PDF input.
- Convert Film metadata into ordered activation fields.
- Preserve unknown field keys and omit blank values.
- Render escaped Vietnamese/customer values into HTML.
- Include CSS and embedded static assets.
- Use the renderer URL when configured.
- Reject renderer non-2xx responses and timeouts.
- Resolve a local Chrome/Edge path only when no renderer URL exists.

### Integration tests

- Render a real certificate through Chromium and assert `%PDF-`.
- Parse the output and assert one page for a short fixture.
- Render enough Product/field rows to assert more than one page.
- Confirm backgrounds are printed.

### Regression tests

- Existing issuance still uploads one PDF and creates one
  `WarrantyCertificate`.
- Existing email attachment behavior remains unchanged.
- Renderer failure persists the existing failed-certificate lifecycle.

## 10. Acceptance Criteria

1. Existing certificate issuance uses HTML/CSS rather than `pdf-lib`
   coordinates.
2. The public `WarrantyCertificatePdfService` input contract remains stable.
3. Vietnamese text, long values, and missing values render safely.
4. Long dynamic data creates additional pages without losing rows.
5. Production API delegates rendering to an internal Chromium service.
6. Local development can use either the renderer service or installed
   Chrome/Edge.
7. A renderer failure does not produce an unbranded fallback document.
8. No template database model, template Admin UI, or Prisma migration is added.
9. Existing certificate issuance, storage, and email tests continue to pass.

## 11. Deferred Work

- `WarrantyActivationRequestCertificate` persistence.
- One request-owned certificate for one or many Products.
- Admin request-level certificate actions.
- Passing configured category labels directly to the shared view model.
- Visual template editor or database-backed templates.
- Multiple visual styles or per-category template selection.
