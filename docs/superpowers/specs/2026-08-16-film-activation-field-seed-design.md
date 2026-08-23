# Film Activation Field Seed Design

## Goal

Ensure a freshly migrated and seeded development database contains the seven
Film installation-position activation fields required by the multi-product
warranty activation flow.

## Current Problem

The migration copies legacy activation fields from existing category metadata.
On a reset database, migrations run before the Film category is seeded, so
there is no legacy category data to copy. The current category seed creates the
Film category but does not create relational activation fields, leaving the
Admin configuration form empty.

## Design

- Define the seven Film activation fields in the category seed as
  `PRODUCT_SELECT` fields in their intended display order.
- After upserting the Film category, initialize the seven relational fields and
  enable its activation form only when the category has no relational
  activation fields.
- Create all seven fields in one transaction so initialization is atomic.
- If any relational activation configuration already exists, preserve it and
  its enablement flag. Seed execution must not overwrite Admin customization.
- Static options are not created because `PRODUCT_SELECT` reads eligible
  physical Products from the products API.

## Testing

- A seed test starts with a Film category that has no activation fields and
  verifies all seven fields are created in order with type `PRODUCT_SELECT`.
- A seed test starts with an existing configuration and verifies the seed does
  not create, replace, or enable anything.
- Existing category and warranty activation tests remain green.

## Business Logic Impact

This does not change runtime activation rules. It only makes reset/seeded
databases start with the same Film configuration that an upgraded database
receives from the migration.
