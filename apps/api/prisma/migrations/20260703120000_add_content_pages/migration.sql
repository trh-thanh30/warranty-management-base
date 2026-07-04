ALTER TYPE "permission_key" ADD VALUE 'CONTENT_PAGE_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'CONTENT_PAGE_CREATE';
ALTER TYPE "permission_key" ADD VALUE 'CONTENT_PAGE_UPDATE';
ALTER TYPE "permission_key" ADD VALUE 'CONTENT_PAGE_DELETE';

CREATE TYPE "content_page_kind" AS ENUM ('POLICY', 'GUIDE', 'INTRO', 'FAQ');
CREATE TYPE "content_page_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "content_page" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "kind" "content_page_kind" NOT NULL DEFAULT 'POLICY',
    "status" "content_page_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_page_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_page_slug_key" ON "content_page"("slug");
CREATE INDEX "content_page_kind_idx" ON "content_page"("kind");
CREATE INDEX "content_page_status_idx" ON "content_page"("status");
CREATE INDEX "content_page_published_at_idx" ON "content_page"("published_at");
