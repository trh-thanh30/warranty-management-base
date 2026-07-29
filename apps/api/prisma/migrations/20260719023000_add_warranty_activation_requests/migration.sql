-- CreateEnum
CREATE TYPE "warranty_activation_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVATED', 'CANCELLED');

-- CreateTable
CREATE TABLE "warranty_activation_request" (
    "id" UUID NOT NULL,
    "request_code" TEXT NOT NULL,
    "status" "warranty_activation_request_status" NOT NULL DEFAULT 'PENDING',
    "warranty_code" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_birthdate" TIMESTAMP(3),
    "province_code" TEXT NOT NULL,
    "province_name" TEXT NOT NULL,
    "ward_code" TEXT NOT NULL,
    "ward_name" TEXT NOT NULL,
    "address_detail" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "product_name" TEXT,
    "serial_number" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "manufacture_year" INTEGER,
    "note" TEXT,
    "admin_note" TEXT,
    "rejection_reason" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "activated_warranty_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_activation_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warranty_activation_request_request_code_key" ON "warranty_activation_request"("request_code");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_activation_request_activated_warranty_id_key" ON "warranty_activation_request"("activated_warranty_id");

-- CreateIndex
CREATE INDEX "warranty_activation_request_request_code_idx" ON "warranty_activation_request"("request_code");

-- CreateIndex
CREATE INDEX "warranty_activation_request_status_idx" ON "warranty_activation_request"("status");

-- CreateIndex
CREATE INDEX "warranty_activation_request_warranty_code_idx" ON "warranty_activation_request"("warranty_code");

-- CreateIndex
CREATE INDEX "warranty_activation_request_customer_phone_idx" ON "warranty_activation_request"("customer_phone");

-- CreateIndex
CREATE INDEX "warranty_activation_request_customer_email_idx" ON "warranty_activation_request"("customer_email");

-- CreateIndex
CREATE INDEX "warranty_activation_request_created_at_idx" ON "warranty_activation_request"("created_at");

-- CreateIndex
CREATE INDEX "warranty_activation_request_lookup_pending" ON "warranty_activation_request"("warranty_code", "customer_phone", "status");

-- AddForeignKey
ALTER TABLE "warranty_activation_request" ADD CONSTRAINT "warranty_activation_request_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_activation_request" ADD CONSTRAINT "warranty_activation_request_activated_warranty_id_fkey" FOREIGN KEY ("activated_warranty_id") REFERENCES "warranty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
