-- Expand phase for Product field normalization.
-- Keep the catalogue_* columns until all application readers have migrated.
ALTER TABLE "product"
  ADD COLUMN "brand" TEXT,
  ADD COLUMN "model" TEXT,
  ADD COLUMN "model_year" INTEGER,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "published_at" TIMESTAMP(3);

UPDATE "product"
SET
  "brand" = "catalogue_brand",
  "model" = "catalogue_model",
  "model_year" = "catalogue_model_year",
  "description" = "catalogue_description",
  "slug" = "catalogue_slug",
  "is_published" = "catalogue_is_published",
  "published_at" = "catalogue_published_at";

CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");
