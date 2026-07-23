-- Create dealer module table.
CREATE TABLE "dealer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "sales_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dealer_phone_key" ON "dealer"("phone");
CREATE INDEX "dealer_is_active_idx" ON "dealer"("is_active");
CREATE INDEX "dealer_province_idx" ON "dealer"("province");
CREATE INDEX "dealer_name_idx" ON "dealer"("name");

-- Extend activation request with vehicle/dealer/category/product context.
ALTER TABLE "warranty_activation_request"
ADD COLUMN "category_id" UUID,
ADD COLUMN "product_id" UUID,
ADD COLUMN "dealer_id" UUID,
ADD COLUMN "vehicle_plate" TEXT,
ADD COLUMN "vehicle_model" TEXT,
ADD COLUMN "installed_at" TIMESTAMP(3),
ADD COLUMN "warranty_duration_months" INTEGER;

ALTER TABLE "warranty_activation_request"
ALTER COLUMN "customer_email" DROP NOT NULL;

ALTER TABLE "warranty_certificate"
ALTER COLUMN "recipient_email" DROP NOT NULL;

CREATE INDEX "warranty_activation_request_category_id_idx" ON "warranty_activation_request"("category_id");
CREATE INDEX "warranty_activation_request_product_id_idx" ON "warranty_activation_request"("product_id");
CREATE INDEX "warranty_activation_request_dealer_id_idx" ON "warranty_activation_request"("dealer_id");
CREATE INDEX "warranty_activation_request_vehicle_plate_idx" ON "warranty_activation_request"("vehicle_plate");

ALTER TABLE "warranty_activation_request"
ADD CONSTRAINT "warranty_activation_request_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request"
ADD CONSTRAINT "warranty_activation_request_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request"
ADD CONSTRAINT "warranty_activation_request_dealer_id_fkey"
FOREIGN KEY ("dealer_id") REFERENCES "dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TYPE "permission_key" ADD VALUE IF NOT EXISTS 'DEALER_VIEW';
ALTER TYPE "permission_key" ADD VALUE IF NOT EXISTS 'DEALER_CREATE';
ALTER TYPE "permission_key" ADD VALUE IF NOT EXISTS 'DEALER_UPDATE';
ALTER TYPE "permission_key" ADD VALUE IF NOT EXISTS 'DEALER_DELETE';
