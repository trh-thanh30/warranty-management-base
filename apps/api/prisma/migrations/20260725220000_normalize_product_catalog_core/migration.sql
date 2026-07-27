-- Development-only hard normalization. This branch has not reached production;
-- reset serialized product data instead of preserving transitional snapshots.
TRUNCATE TABLE "product_template" CASCADE;

ALTER TABLE "product_template"
  ADD COLUMN "sku" TEXT NOT NULL,
  ADD COLUMN "slug" TEXT NOT NULL,
  ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "published_at" TIMESTAMP(3);

ALTER TABLE "product_template"
  RENAME COLUMN "manufacture_year" TO "model_year";

ALTER TABLE "product_template"
  ALTER COLUMN "category_id" SET NOT NULL,
  DROP COLUMN "category";

CREATE UNIQUE INDEX "product_template_sku_key"
  ON "product_template"("sku");
CREATE UNIQUE INDEX "product_template_slug_key"
  ON "product_template"("slug");
CREATE INDEX "product_template_is_published_published_at_idx"
  ON "product_template"("is_published", "published_at");

DROP INDEX IF EXISTS "product_template_category_idx";

ALTER TABLE "product_template"
  DROP CONSTRAINT "product_template_category_id_fkey";
ALTER TABLE "product_template"
  ADD CONSTRAINT "product_template_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product" ADD COLUMN "display_name" TEXT;

ALTER TABLE "product"
  DROP CONSTRAINT "product_template_id_fkey";
ALTER TABLE "product"
  ALTER COLUMN "template_id" SET NOT NULL;
ALTER TABLE "product"
  ADD CONSTRAINT "product_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "product_template"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "product_category_idx";
DROP INDEX IF EXISTS "product_category_id_idx";
DROP INDEX IF EXISTS "product_is_published_status_deleted_at_idx";
DROP INDEX IF EXISTS "product_warranty_code_idx";
DROP INDEX IF EXISTS "product_name_idx";
DROP INDEX IF EXISTS "product_slug_key";
DROP INDEX IF EXISTS "product_warranty_code_key";

ALTER TABLE "product"
  DROP CONSTRAINT IF EXISTS "product_category_id_fkey";

ALTER TABLE "product"
  DROP COLUMN "slug",
  DROP COLUMN "warranty_code",
  DROP COLUMN "name",
  DROP COLUMN "category",
  DROP COLUMN "category_id",
  DROP COLUMN "brand",
  DROP COLUMN "model",
  DROP COLUMN "manufacture_year",
  DROP COLUMN "description",
  DROP COLUMN "is_published",
  DROP COLUMN "published_at";

CREATE INDEX "product_display_name_idx" ON "product"("display_name");
