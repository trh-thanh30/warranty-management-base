# Warranty Lookup Form Design

## Goal

Standardize both public warranty lookup entry points on the Web app with the
existing shadcn-style form primitives, React Hook Form, and Zod without
changing the lookup API or result presentation.

## Architecture

- Add one reusable `WarrantyLookupForm` under `apps/web/src/components/common`.
- Keep the lookup mutation in each parent through the existing
  `useWarrantyLookup` hook.
- Let the shared form own input state, client validation, accessible error
  rendering, and pending submit state.
- Use a schema factory so Vietnamese and English validation messages remain
  localized.
- Support `page` and `modal` layout variants without duplicating form logic.

## Validation

- Trim surrounding whitespace before submit.
- Require 6 to 64 characters.
- Accept only ASCII letters, digits, and hyphens.
- Display validation failures through `FormMessage`.
- Clear the current lookup result or request error whenever the value changes.

## Compatibility

- Preserve the existing page and modal dimensions and responsive behavior.
- Preserve modal initial-query lookup behavior.
- Reuse existing dependencies and UI primitives; add no packages.
- Keep all backend and public API contracts unchanged.

## Verification

- Unit-test valid normalization and all invalid schema cases.
- Add a source-level regression test proving both entry points render the
  shared form instead of native duplicated form markup.
- Run the Web test suite, targeted ESLint, TypeScript checks, Prettier, and
  `git diff --check`.
