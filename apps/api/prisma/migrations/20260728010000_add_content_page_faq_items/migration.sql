CREATE TABLE "content_page_faq_item" (
    "id" UUID NOT NULL,
    "content_page_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_page_faq_item_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_page_faq_item_content_page_id_is_active_sort_order_idx"
ON "content_page_faq_item"("content_page_id", "is_active", "sort_order");

ALTER TABLE "content_page_faq_item"
ADD CONSTRAINT "content_page_faq_item_content_page_id_fkey"
FOREIGN KEY ("content_page_id") REFERENCES "content_page"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
