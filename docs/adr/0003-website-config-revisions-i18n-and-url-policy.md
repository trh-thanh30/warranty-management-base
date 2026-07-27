# 0003 - Website Config Revisions, Localization, and URL Policy

## Status

Accepted

## Context

The public website needs content managed by Admin without deploying the
frontend. Site information and navigation have different schemas, but they
share the same publishing, localization, asset, and link safety requirements.

Directly editing the public record would expose partial changes. Free-form
JSON, raw asset paths, and unrestricted links would also make the public
contract difficult to validate and unsafe to render.

## Decision

Each website-config domain owns one mutable `DRAFT` revision and at most one
`PUBLISHED` revision for a `siteKey`. Publishing validates the complete draft,
replaces the previous public snapshot transactionally, and creates a fresh
draft cloned from that snapshot. Every mutation uses an expected draft version
to prevent silent overwrites.

Vietnamese (`vi`) is required for publish. English (`en`) is optional and uses
Vietnamese as the public-read fallback. Draft responses preserve both locales;
public and preview endpoints resolve one requested locale.

Navigation links and CTA links use explicit discriminators:

- `INTERNAL`: root-relative paths only, excluding protocol-relative URLs.
- `EXTERNAL`: absolute `http` or `https` URLs only.
- `EMAIL`: valid `mailto:` URLs only.
- `PHONE`: valid `tel:` URLs only.

Images are referenced by Asset IDs; public DTOs resolve those IDs to safe
public asset data. Database foreign keys prevent deleting referenced assets.

Admin has separate permissions for viewing, updating drafts, and publishing.
Every mutation and publish action writes a website-config audit record.

Homepage configuration is intentionally excluded. Its content remains owned by
the public Web application until a separate content-model decision is made.

## Consequences

- Public reads never expose half-finished Admin changes.
- Editors receive a conflict instead of overwriting a newer draft.
- Frontends consume stable, locale-resolved DTOs rather than database rows.
- Link and asset validation is centralized and consistent across Admin and API.
- Revision cloning costs additional writes, accepted in exchange for simple
  rollback semantics and predictable public reads.
