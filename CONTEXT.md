# Project Context

## Shared Language

- **Base repo**: reusable monorepo template that new products can fork or copy from.
- **Vertical slice**: a small task that passes through the relevant API, package, and UI layers to validate integration early.
- **Core module**: generic module that can be reused across domains, such as auth, users, settings, files, email, notifications, and health.
- **Domain module**: product-specific module, such as booking, ecommerce, CRM, inventory, or billing.

## Architecture Principles

- Keep template code generic. Domain code belongs in separate modules.
- Prefer deep modules with clear public interfaces over many shallow helper files.
- Shared packages must not import from apps.
- Apps may import from packages through workspace dependencies.
- Add tests around behavior and module contracts, not implementation details.
- Frontend i18n uses locale-prefixed routes with `vi` as the default locale and
  `en` as the secondary locale. Next.js apps own their `src/messages` catalogs
  and use app-local `src/i18n/navigation.ts` helpers for locale-aware links.
