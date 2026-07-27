# 0003 - Product Template and physical Product

## Status

Accepted

## Context

Repeated installations of the same catalog item currently require staff to
re-enter the same name, category, brand, model, description, specifications,
and cover image for every physical unit. `Product` therefore mixes reusable
catalog data with the identity and lifecycle of one warrantable unit.

## Decision

Introduce `ProductTemplate` as the reusable catalog definition and keep
`Product` as the physical warrantable unit.

- A Product may reference one Product Template.
- Product code, serial number, ownership, warranty, claims, and installation
  context remain on Product.
- Shared descriptive data, technical specifications, default warranty policy,
  and reusable media belong to Product Template.
- Product keeps a snapshot of shared fields during the transition so existing
  clients, exports, activation requests, and historical display remain stable.
- Existing Product rows remain valid with a null `template_id`.

## Consequences

Staff can create subsequent physical Products by selecting a Product Template
and entering only unit-specific data. Reusing an Asset relation avoids uploading
the same file to object storage for every Product.

- Template edits become the effective catalogue values shown on linked Products.
- Existing Product columns remain transition snapshots and warranty records keep
  their issued policy values.
- COVER and GALLERY relations belong to Product Template; SERIAL and INSTALLATION
  relations belong to Product.
- Legacy Products can be converted explicitly, moving only reusable relations
  and preserving the physical Product, owner, and warranty identities.
