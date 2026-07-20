-- CreateEnum
CREATE TYPE "product_asset_role" AS ENUM ('COVER', 'GALLERY', 'SERIAL', 'INSTALLATION');

-- CreateTable
CREATE TABLE "product_asset" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "role" "product_asset_role" NOT NULL DEFAULT 'GALLERY',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_asset_product_id_asset_id_key" ON "product_asset"("product_id", "asset_id");

-- Enforce one cover image per product.
CREATE UNIQUE INDEX "product_asset_one_cover_per_product" ON "product_asset"("product_id") WHERE "role" = 'COVER';

-- CreateIndex
CREATE INDEX "product_asset_product_id_role_sort_order_idx" ON "product_asset"("product_id", "role", "sort_order");

-- CreateIndex
CREATE INDEX "product_asset_asset_id_idx" ON "product_asset"("asset_id");

-- AddForeignKey
ALTER TABLE "product_asset" ADD CONSTRAINT "product_asset_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_asset" ADD CONSTRAINT "product_asset_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
