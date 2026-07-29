# Web i18n and Design Token Cleanup

## Goal

Make every public Web route consistently bilingual, remove arbitrary font-size utilities, use the color tokens declared in `apps/web/app/globals.css`, and keep feature data and behavior in the folders prescribed by the frontend architecture guide.

## Scope

- All user-facing code under `apps/web/app` and `apps/web/src`.
- Locale-aware metadata for Vietnamese and English.
- Shared shell, Home, About, Products, Warranty, Dealers, Contact, Policy, Guide, and Support Centers.
- Static source guards for typography, color tokens, and locale message parity.

## Architecture

Each route keeps a thin server `page.tsx` and renders a view from `src/views`. User-facing copy lives in feature namespaces in `src/messages/vi.json` and `src/messages/en.json`. Feature constants contain only language-neutral structure such as IDs, routes, assets, technical values, and translation keys.

Hooks remain local unless they encapsulate a coherent behavior or are reused. Large features may introduce a feature hook such as `useDealerFilters`; simple component state stays in the component. Large views are split into private feature components instead of moving JSX into hooks.

## Typography

- Do not use arbitrary font-size utilities such as `text-[8px]` or `text-[1.25rem]`.
- Use Tailwind's standard type scale.
- Captions and badges use at least `text-xs`.
- Mobile body copy uses at least `text-base`.
- Use no weight above `font-semibold`; ordinary copy uses normal or medium weight.

## Color Tokens

Components use the named Tailwind tokens declared in `globals.css`, including `deep-black`, `premium-red`, `warm-red`, `stone-gray`, `light-gray`, `border-gray`, and `off-white`. Raw hex utilities are forbidden in component and view source. New semantic aliases are added only when an existing token does not express the purpose.

## Internationalization

- Use `useTranslations` in client components and `getTranslations` in server metadata.
- Namespace messages by feature.
- Translate visible headings, descriptions, labels, placeholders, validation messages, button text, aria labels, and descriptive image alt text.
- Keep brand names, product codes, phone numbers, URLs, VINs, and real addresses as language-neutral data where appropriate.
- Vietnamese and English message trees must have matching keys.

## Verification

Static tests reject arbitrary font-size utilities and raw hex color utilities in `apps/web/src` and ensure `vi.json` and `en.json` expose identical message paths. Typecheck and focused ESLint run after each feature batch. Existing shared-header route tests remain valid.
