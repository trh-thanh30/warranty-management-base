-- CreateEnum
CREATE TYPE "warranty_claim_status" AS ENUM (
    'SUBMITTED',
    'REVIEWING',
    'APPROVED',
    'REJECTED',
    'IN_REPAIR',
    'COMPLETED',
    'CANCELLED'
);

-- AlterEnum
ALTER TYPE "permission_key" ADD VALUE 'WARRANTY_CLAIM_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'WARRANTY_CLAIM_CREATE';
ALTER TYPE "permission_key" ADD VALUE 'WARRANTY_CLAIM_UPDATE';
ALTER TYPE "permission_key" ADD VALUE 'WARRANTY_CLAIM_STATUS_UPDATE';

-- CreateTable
CREATE TABLE "warranty_claim" (
    "id" UUID NOT NULL,
    "claim_code" TEXT NOT NULL,
    "warranty_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "customer_id" UUID,
    "warranty_code" TEXT NOT NULL,
    "requester_name" TEXT,
    "requester_phone" TEXT,
    "issue_title" TEXT NOT NULL,
    "issue_detail" TEXT,
    "status" "warranty_claim_status" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warranty_claim_claim_code_key" ON "warranty_claim"("claim_code");

-- CreateIndex
CREATE INDEX "warranty_claim_claim_code_idx" ON "warranty_claim"("claim_code");

-- CreateIndex
CREATE INDEX "warranty_claim_warranty_code_idx" ON "warranty_claim"("warranty_code");

-- CreateIndex
CREATE INDEX "warranty_claim_status_idx" ON "warranty_claim"("status");

-- CreateIndex
CREATE INDEX "warranty_claim_product_id_idx" ON "warranty_claim"("product_id");

-- CreateIndex
CREATE INDEX "warranty_claim_customer_id_idx" ON "warranty_claim"("customer_id");

-- CreateIndex
CREATE INDEX "warranty_claim_created_at_idx" ON "warranty_claim"("created_at");

-- AddForeignKey
ALTER TABLE "warranty_claim" ADD CONSTRAINT "warranty_claim_warranty_id_fkey" FOREIGN KEY ("warranty_id") REFERENCES "warranty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim" ADD CONSTRAINT "warranty_claim_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim" ADD CONSTRAINT "warranty_claim_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
