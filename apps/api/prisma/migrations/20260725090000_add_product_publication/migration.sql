ALTER TABLE "product"
ADD COLUMN "slug" TEXT,
ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "published_at" TIMESTAMP(3);

UPDATE "product"
SET "slug" = LOWER("product_code");

ALTER TABLE "product"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");
CREATE INDEX "product_is_published_status_deleted_at_idx"
ON "product"("is_published", "status", "deleted_at");
