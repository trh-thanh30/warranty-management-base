-- Normalize product-owned catalogue fields while preserving existing data.
-- Product code is the authoritative SKU; display_name is the authoritative name.
UPDATE "product"
SET "display_name" = COALESCE(NULLIF("display_name", ''), "catalogue_name")
WHERE "catalogue_name" IS NOT NULL;

UPDATE "product"
SET "metadata" = CASE
  WHEN "catalogue_metadata" IS NULL THEN "metadata"
  ELSE COALESCE("catalogue_metadata", '{}'::jsonb) || COALESCE("metadata", '{}'::jsonb)
END;

ALTER TABLE "product"
  RENAME COLUMN "catalogue_slug" TO "slug";
ALTER INDEX "product_catalogue_slug_key" RENAME TO "product_slug_key";
ALTER TABLE "product"
  RENAME COLUMN "catalogue_brand" TO "brand";
ALTER TABLE "product"
  RENAME COLUMN "catalogue_model" TO "model";
ALTER TABLE "product"
  RENAME COLUMN "catalogue_model_year" TO "model_year";
ALTER TABLE "product"
  RENAME COLUMN "catalogue_description" TO "description";
ALTER TABLE "product"
  RENAME COLUMN "catalogue_is_published" TO "is_published";
ALTER TABLE "product"
  RENAME COLUMN "catalogue_published_at" TO "published_at";

ALTER TABLE "product"
  DROP COLUMN "catalogue_name",
  DROP COLUMN "catalogue_sku",
  DROP COLUMN "catalogue_metadata";
