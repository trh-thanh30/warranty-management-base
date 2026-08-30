-- Phase 3: allow products to be created without a ProductTemplate.
-- The relation remains available temporarily for rollback reads.
ALTER TABLE "product"
  ALTER COLUMN "template_id" DROP NOT NULL,
  ADD COLUMN "catalogue_is_published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "catalogue_published_at" TIMESTAMP(3);

-- Synchronize once more immediately before the application read cut-over.
UPDATE "product" AS p
SET
  "catalogue_name" = t."name",
  "catalogue_sku" = p."product_code",
  "catalogue_slug" = CONCAT(t."slug", '-', LOWER(p."product_code")),
  "catalogue_brand" = t."brand",
  "catalogue_model" = t."model",
  "catalogue_model_year" = t."model_year",
  "catalogue_description" = t."description",
  "catalogue_metadata" = t."metadata",
  "catalogue_is_published" = t."is_published",
  "catalogue_published_at" = t."published_at"
FROM "product_template" AS t
WHERE p."template_id" = t."id";

-- Product now owns its public identity. These fields are mandatory for every
-- new product and unique slugs keep public detail routes deterministic.
ALTER TABLE "product"
  ALTER COLUMN "catalogue_name" SET NOT NULL,
  ALTER COLUMN "catalogue_sku" SET NOT NULL,
  ALTER COLUMN "catalogue_slug" SET NOT NULL;

CREATE UNIQUE INDEX "product_catalogue_sku_key"
  ON "product"("catalogue_sku");
CREATE UNIQUE INDEX "product_catalogue_slug_key"
  ON "product"("catalogue_slug");

-- Copy galleries that are not already attached to the physical product.
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
WHERE pta."role" = 'GALLERY'
  AND NOT EXISTS (
    SELECT 1 FROM "product_asset" AS pa
    WHERE pa."product_id" = p."id" AND pa."asset_id" = pta."asset_id"
  );

-- Copy a template cover only when the product has no cover of its own.
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
WHERE pta."role" = 'COVER'
  AND pta."id" = (
    SELECT cover."id"
    FROM "product_template_asset" AS cover
    WHERE cover."product_template_id" = p."template_id"
      AND cover."role" = 'COVER'
    ORDER BY cover."sort_order" ASC, cover."created_at" ASC, cover."id" ASC
    LIMIT 1
  )
  AND NOT EXISTS (
    SELECT 1 FROM "product_asset" AS pa
    WHERE pa."product_id" = p."id" AND pa."role" = 'COVER'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "product_asset" AS pa
    WHERE pa."product_id" = p."id" AND pa."asset_id" = pta."asset_id"
  );
