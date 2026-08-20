# Request-Owned Activation Certificate Implementation Plan

## Constraints

- Execute inline and sequentially.
- Use TDD for behavior changes.
- Reuse the existing HTML/CSS renderer; do not restore the old pdf-lib request
  renderer from stash.
- Put Prisma access behind repositories.
- Do not reset the database or commit without explicit authorization.

## Task 1: Persistence contract

- Add a failing schema/migration contract test.
- Add `WarrantyActivationRequestCertificate` and its one-to-one relation.
- Add the migration with explicit constraint names matching Prisma schema.
- Generate Prisma Client and run the focused test.

## Task 2: Shared multi-product PDF composition

- Add failing tests for rendering a request view model with one and many items.
- Add a request-to-certificate view-model builder.
- Expose a shared `createPdfFromViewModel` method on
  `WarrantyCertificatePdfService`; preserve its existing singular API.
- Verify HTML contains every item and Chromium pagination remains available.

## Task 3: Request certificate repository and issuance

- Add a repository for request certificate persistence and issuance snapshots.
- Add failing tests for one item, many items, idempotency, generation failure,
  number conflicts, and upload cleanup.
- Implement one issuing use case using the shared PDF facade.
- Queue one request-certificate email when a recipient exists.

## Task 4: Email lifecycle

- Add failing tests for one attachment and all item summaries.
- Implement request-certificate email queue/resend services through repository.
- Extend email job data and worker status updates for request certificates.
- Preserve Product-certificate worker behavior.

## Task 5: Canonical request API and review flow

- Make approval invoke the request issuer after activation commits.
- Persist certificate failures without failing the activated response.
- Make request download/resend resolve only the request certificate.
- Remove item certificate routes and mapper fields.
- Update shared contracts and focused API tests.

## Task 6: Admin request-level UX

- Add a failing source/UI regression test.
- Remove item certificate handlers, buttons, service methods, and unused i18n.
- Keep one request-level certificate summary and action group.
- Run Admin tests, typecheck, and lint.

## Task 7: Verification

- Run focused tests after every task.
- Run full API and Admin tests sequentially.
- Run Shared/API/Admin typechecks and lint.
- Run relevant builds and `git diff --check`.
- Do not run a database reset; report migration instructions separately.
