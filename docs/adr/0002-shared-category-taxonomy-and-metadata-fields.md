# 0002 - Shared Category Taxonomy and Metadata Fields

## Status

Accepted

## Context

The warranty domain started with `Product.category` as a fixed Prisma enum. That is useful for early API stability, but it becomes too rigid when Admin needs to manage display names, icons, images, ordering, parent/child grouping, and future category-like data across modules.

Several modules also need extension data that should not require a schema migration every time a non-core integration or display-only attribute appears.

## Decision

Add a shared `Category` taxonomy model with a `category_type` enum. The first supported type is `PRODUCT`, with room for `CONTENT_PAGE`, `ASSET`, and `WARRANTY_CLAIM_ISSUE`.

Keep `Product.category` as a legacy/backward-compatible enum during the transition. Add `Product.category_id` to connect products to dynamic categories. New frontend work should prefer `categoryId/categoryRef` while still sending the legacy bucket until the enum can be safely removed.

Add nullable `metadata Json?` fields to core domain models that may need extension data:

- `Customer`
- `Product`
- `Warranty`
- `WarrantyClaim`
- `ServiceCenter`

## Rules

- `metadata` is for extension data, integration references, display hints, and low-query-frequency attributes.
- Fields required for business decisions, filtering, sorting, permissions, status transitions, or reporting must be first-class columns.
- Category identity should use `type + slug`; `name` is display text and may change.
- Category deletion is soft deactivation through `is_active = false`; historical references should remain meaningful.

## Consequences

- Admin can manage product categories without code changes.
- Products can migrate gradually from enum-only categories to dynamic category records.
- Future migrations can remove `Product.category` after all clients use `categoryId` and a replacement reporting strategy exists.
