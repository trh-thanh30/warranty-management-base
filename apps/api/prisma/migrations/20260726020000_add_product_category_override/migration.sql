ALTER TABLE "product"
  ADD COLUMN "category_id" UUID;

UPDATE "product" AS product
SET "category_id" = template."category_id"
FROM "product_template" AS template
WHERE product."template_id" = template."id";

ALTER TABLE "product"
  ALTER COLUMN "category_id" SET NOT NULL;

CREATE INDEX "product_category_id_idx"
  ON "product"("category_id");

ALTER TABLE "product"
  ADD CONSTRAINT "product_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
