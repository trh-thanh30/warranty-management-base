# 0006 - Product as the authoritative catalogue aggregate

## Status

Accepted

## Context

The Product Template abstraction no longer matches the operational workflow.
Catalogue values were copied onto Product in an expand/backfill/cutover sequence,
but transitional application code still included Product Template relations and
could fall back to their values.

## Decision

Product is the only authoritative aggregate for catalogue and physical-unit
data.

- Active application flows read catalogue fields and media directly from Product.
- Product create, update, import, and seed flows do not write `template_id` or
  Product Template records.
- Product Template API providers are not composed into the running API.
- Admin navigation exposes Product only; legacy Product Template URLs redirect
  to the Product directory.
- Product Template tables, relations, permissions, shared contracts, and source
  remain temporarily for rollback and are removed only after production audit.

## Consequences

Warranty, activation, claim, certificate, analytics, public catalogue, Excel,
and seed flows no longer depend on Product Template persistence. Rollback data
remains intact during the verification window, while boundary tests prevent new
runtime dependencies from being introduced.
