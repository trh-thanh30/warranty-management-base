-- Activation code foundation. Existing products, warranties and dealers are preserved.
CREATE TYPE "warranty_method" AS ENUM ('REPAIR', 'REPLACEMENT', 'REPAIR_OR_REPLACEMENT');
CREATE TYPE "activation_code_status" AS ENUM ('AVAILABLE', 'PENDING_APPROVAL', 'ACTIVATED', 'EXPIRED', 'REVOKED', 'REPLACED');

ALTER TABLE "warranty"
  ADD COLUMN "method" "warranty_method" NOT NULL DEFAULT 'REPAIR';

ALTER TABLE "dealer"
  ADD COLUMN "dealer_code" TEXT;

UPDATE "dealer"
SET "dealer_code" = 'DLR-' || UPPER(REPLACE(SUBSTRING("id"::text FROM 1 FOR 8), '-', ''))
WHERE "dealer_code" IS NULL;

ALTER TABLE "dealer"
  ALTER COLUMN "dealer_code" SET NOT NULL;
ALTER TABLE "dealer"
  ALTER COLUMN "dealer_code" DROP DEFAULT;
CREATE UNIQUE INDEX "dealer_dealer_code_key" ON "dealer"("dealer_code");

CREATE TABLE "activation_code_batch" (
  "id" UUID NOT NULL,
  "batch_code" TEXT NOT NULL,
  "source_product_id" UUID,
  "product_sku" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "brand" TEXT,
  "model" TEXT,
  "model_year" INTEGER,
  "warranty_duration_months" INTEGER NOT NULL,
  "warranty_method" "warranty_method" NOT NULL,
  "warranty_terms" TEXT,
  "quantity" INTEGER NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_by_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "activation_code_batch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "activation_code_batch_batch_code_key" ON "activation_code_batch"("batch_code");
CREATE INDEX "activation_code_batch_source_product_id_idx" ON "activation_code_batch"("source_product_id");
CREATE INDEX "activation_code_batch_expires_at_idx" ON "activation_code_batch"("expires_at");
CREATE INDEX "activation_code_batch_created_at_idx" ON "activation_code_batch"("created_at");
ALTER TABLE "activation_code_batch"
  ADD CONSTRAINT "activation_code_batch_source_product_id_fkey"
  FOREIGN KEY ("source_product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activation_code_batch"
  ADD CONSTRAINT "activation_code_batch_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "activation_code" (
  "id" UUID NOT NULL,
  "batch_id" UUID NOT NULL,
  "code_hash" TEXT NOT NULL,
  "code_ciphertext" TEXT NOT NULL,
  "status" "activation_code_status" NOT NULL DEFAULT 'AVAILABLE',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "product_id" UUID,
  "activated_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "replaced_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "activation_code_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "activation_code_code_hash_key" ON "activation_code"("code_hash");
CREATE UNIQUE INDEX "activation_code_product_id_key" ON "activation_code"("product_id");
CREATE UNIQUE INDEX "activation_code_replaced_by_id_key" ON "activation_code"("replaced_by_id");
CREATE INDEX "activation_code_batch_id_status_idx" ON "activation_code"("batch_id", "status");
CREATE INDEX "activation_code_status_expires_at_idx" ON "activation_code"("status", "expires_at");
ALTER TABLE "activation_code"
  ADD CONSTRAINT "activation_code_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "activation_code_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activation_code"
  ADD CONSTRAINT "activation_code_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activation_code"
  ADD CONSTRAINT "activation_code_replaced_by_id_fkey"
  FOREIGN KEY ("replaced_by_id") REFERENCES "activation_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request"
  ADD COLUMN "activation_code_id" UUID;
CREATE UNIQUE INDEX "warranty_activation_request_activation_code_id_key"
  ON "warranty_activation_request"("activation_code_id");

ALTER TABLE "warranty_activation_request"
  ADD CONSTRAINT "warranty_activation_request_activation_code_id_fkey"
  FOREIGN KEY ("activation_code_id") REFERENCES "activation_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;
