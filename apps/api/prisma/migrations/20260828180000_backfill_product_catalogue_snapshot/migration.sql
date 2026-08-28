-- Phase 2: backfill catalogue data onto each physical product.
-- This migration intentionally runs after the expand migration so the
-- snapshot can be validated before the application cut-over.

-- Synchronize the snapshot from the authoritative template at the time this
-- migration runs. Product does not write these columns until the cut-over, so
-- overwriting them here prevents a partial/stale pre-cut-over snapshot.
UPDATE "product" AS p
SET
  "catalogue_name" = t."name",
  "catalogue_sku" = t."sku",
  "catalogue_slug" = t."slug",
  "catalogue_brand" = t."brand",
  "catalogue_model" = t."model",
  "catalogue_model_year" = t."model_year",
  "catalogue_description" = t."description",
  "catalogue_metadata" = t."metadata"
FROM "product_template" AS t
WHERE p."template_id" = t."id";

-- Template-owned media deliberately remains on product_template_asset in this
-- phase. Copying it early would expose inherited media as PRODUCT media and
-- make it editable/removable before the application read path is cut over.
