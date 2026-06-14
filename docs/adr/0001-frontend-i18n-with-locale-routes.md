# 0001. Frontend i18n with locale-prefixed routes

## Status

Accepted

## Context

The repo has two Next.js App Router clients: `apps/web` and `apps/admin`.
Both need a shared internationalization pattern that keeps route files thin,
preserves the existing `src/views` architecture, and can be reused by future
clients copied from this base repo.

## Decision

Use `next-intl` for frontend internationalization in Next.js apps.

- Supported locales start with `vi` and `en`.
- The default locale is `vi`.
- Public routes are locale-prefixed, for example `/vi/dashboard` and `/en`.
- Locale-aware navigation must use the app-local `src/i18n/navigation.ts`
  helpers instead of importing `next/link` directly inside localized routes.
- Message catalogs live in `src/messages/<locale>.json` inside each app.
- Text-bearing config should be exposed through factory functions that receive
  a translation function instead of calling hooks at module scope.

## Consequences

Each Next.js app owns its own messages and i18n config, while shared packages
remain locale-agnostic unless they later own translatable copy. Backend i18n is
deferred until API validation messages, emails, notifications, or persisted
content need locale-specific behavior.
