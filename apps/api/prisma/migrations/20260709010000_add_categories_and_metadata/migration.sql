-- CreateEnum
CREATE TYPE "category_type" AS ENUM ('PRODUCT', 'CONTENT_PAGE', 'ASSET', 'WARRANTY_CLAIM_ISSUE');

-- AlterEnum
ALTER TYPE "permission_key" ADD VALUE 'CATEGORY_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'CATEGORY_CREATE';
ALTER TYPE "permission_key" ADD VALUE 'CATEGORY_UPDATE';
ALTER TYPE "permission_key" ADD VALUE 'CATEGORY_DELETE';

-- AlterTable
ALTER TABLE "customer" ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "product" ADD COLUMN "category_id" UUID,
ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "service_center" ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "warranty" ADD COLUMN "metadata" JSONB;

-- AlterTable
ALTER TABLE "warranty_claim" ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "type" "category_type" NOT NULL,
    "code" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "icon" TEXT,
    "image_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_type_slug_key" ON "category"("type", "slug");

-- CreateIndex
CREATE INDEX "category_type_is_active_order_idx" ON "category"("type", "is_active", "order");

-- CreateIndex
CREATE INDEX "category_parent_id_idx" ON "category"("parent_id");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product"("category_id");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
