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
