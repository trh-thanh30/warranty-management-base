ALTER TABLE "content_page" ADD COLUMN "category_id" UUID;

ALTER TABLE "content_page"
ADD CONSTRAINT "content_page_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "category"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "content_page_category_id_idx" ON "content_page"("category_id");
