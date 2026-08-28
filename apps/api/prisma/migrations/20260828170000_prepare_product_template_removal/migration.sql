-- Phase 1 (expand): snapshot catalogue data onto each physical product.
-- Keep template_id and all template tables intact until the application
-- cut-over and contract migrations have completed.

ALTER TABLE "product"
  ADD COLUMN "catalogue_name" TEXT,
  ADD COLUMN "catalogue_sku" TEXT,
  ADD COLUMN "catalogue_slug" TEXT,
  ADD COLUMN "catalogue_brand" TEXT,
  ADD COLUMN "catalogue_model" TEXT,
  ADD COLUMN "catalogue_model_year" INTEGER,
  ADD COLUMN "catalogue_description" TEXT,
  ADD COLUMN "catalogue_metadata" JSONB;

-- Idempotent backfill for catalogue fields. Existing non-null snapshots are
-- preserved so a failed/retried migration cannot overwrite an operator fix.
UPDATE "product" AS p
SET
  "catalogue_name" = COALESCE(p."catalogue_name", t."name"),
  "catalogue_sku" = COALESCE(p."catalogue_sku", t."sku"),
  "catalogue_slug" = COALESCE(p."catalogue_slug", t."slug"),
  "catalogue_brand" = COALESCE(p."catalogue_brand", t."brand"),
  "catalogue_model" = COALESCE(p."catalogue_model", t."model"),
  "catalogue_model_year" = COALESCE(p."catalogue_model_year", t."model_year"),
  "catalogue_description" = COALESCE(p."catalogue_description", t."description"),
  "catalogue_metadata" = COALESCE(p."catalogue_metadata", t."metadata")
FROM "product_template" AS t
WHERE p."template_id" = t."id";

-- Preserve template-owned cover/gallery media on the product. Product media
-- remain independent after the cut-over and existing links are not duplicated.
INSERT INTO "product_asset" (
  "id", "product_id", "asset_id", "role", "sort_order", "alt_text",
  "created_at", "updated_at"
)
SELECT
  gen_random_uuid(), p."id", pta."asset_id", pta."role", pta."sort_order",
  pta."alt_text", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "product" AS p
JOIN "product_template_asset" AS pta
  ON pta."product_template_id" = p."template_id"
WHERE pta."role" IN ('COVER', 'GALLERY')
  AND NOT EXISTS (
    SELECT 1
    FROM "product_asset" AS pa
    WHERE pa."product_id" = p."id"
      AND pa."asset_id" = pta."asset_id"
  );
