# 0006 - Product as the authoritative catalogue aggregate

## Status

Amended by [ADR 0007](./0007-generic-activation-code-pool-and-warranty-issuance.md).

ADR 0006 remains authoritative for removing Product Template. ADR 0007 changes
the warranty semantics: Product is the reusable SKU/catalogue record, while an
issued Warranty plus its Activation Code identifies one sold unit.

## Context

The Product Template abstraction no longer matches the operational workflow.
Catalogue values were copied onto Product in an expand/backfill/cutover sequence,
but transitional application code still included Product Template relations and
could fall back to their values.

## Decision

Product is the only authoritative aggregate for catalogue and physical-unit
data.

- Active application flows read catalogue fields and media directly from Product.
- Product create, update, import, and seed flows write Product records only;
  the former template relation is no longer present in the schema.
- Product Template API providers are not composed into the running API.
- Admin navigation exposes Product only; legacy Product Template URLs redirect
  to the Product directory.
- Product Template tables, relations, permissions, shared contracts, and source
  were removed after the application cut-over. Production had no Product
  Template data that required a separate audit or retention window.

## Consequences

Warranty, activation, claim, certificate, analytics, public catalogue, Excel,
and seed flows no longer depend on Product Template persistence. Product is the
only catalogue persistence interface. Historical migrations retain the schema
history, while architecture tests prevent the retired module from returning to
active runtime paths.
