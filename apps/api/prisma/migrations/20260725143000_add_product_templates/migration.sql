CREATE TABLE "product_template" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "product_category" NOT NULL,
    "category_id" UUID,
    "brand" TEXT,
    "model" TEXT,
    "manufacture_year" INTEGER,
    "description" TEXT,
    "default_warranty_duration_months" INTEGER NOT NULL DEFAULT 36,
    "default_warranty_terms" TEXT,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_template_asset" (
    "id" UUID NOT NULL,
    "product_template_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "role" "product_asset_role" NOT NULL DEFAULT 'GALLERY',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_template_asset_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "product" ADD COLUMN "template_id" UUID;

CREATE INDEX "product_template_category_idx" ON "product_template"("category");
CREATE INDEX "product_template_category_id_idx" ON "product_template"("category_id");
CREATE INDEX "product_template_is_active_name_idx" ON "product_template"("is_active", "name");
CREATE INDEX "product_template_brand_model_idx" ON "product_template"("brand", "model");
CREATE UNIQUE INDEX "product_template_asset_product_template_id_asset_id_key" ON "product_template_asset"("product_template_id", "asset_id");
CREATE INDEX "product_template_asset_product_template_id_role_sort_order_idx" ON "product_template_asset"("product_template_id", "role", "sort_order");
CREATE INDEX "product_template_asset_asset_id_idx" ON "product_template_asset"("asset_id");
CREATE INDEX "product_template_id_idx" ON "product"("template_id");

ALTER TABLE "product_template"
ADD CONSTRAINT "product_template_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "category"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_template_asset"
ADD CONSTRAINT "product_template_asset_product_template_id_fkey"
FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_template_asset"
ADD CONSTRAINT "product_template_asset_asset_id_fkey"
FOREIGN KEY ("asset_id") REFERENCES "asset"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product"
ADD CONSTRAINT "product_template_id_fkey"
FOREIGN KEY ("template_id") REFERENCES "product_template"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
