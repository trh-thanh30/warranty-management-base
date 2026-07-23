-- CreateEnum
CREATE TYPE "warranty_activation_request_source" AS ENUM ('PUBLIC_WEB', 'ADMIN_PORTAL');

-- CreateEnum
CREATE TYPE "warranty_certificate_status" AS ENUM ('PENDING', 'GENERATED', 'FAILED');

-- CreateEnum
CREATE TYPE "warranty_certificate_email_status" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "warranty_activation_request"
ADD COLUMN "source" "warranty_activation_request_source" NOT NULL DEFAULT 'PUBLIC_WEB',
ADD COLUMN "created_by_id" UUID,
ADD COLUMN "customer_id" UUID;

-- CreateTable
CREATE TABLE "warranty_certificate" (
    "id" UUID NOT NULL,
    "warranty_id" UUID NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "warranty_certificate_status" NOT NULL DEFAULT 'PENDING',
    "storage_key" TEXT,
    "recipient_email" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3),
    "emailed_at" TIMESTAMP(3),
    "email_status" "warranty_certificate_email_status" NOT NULL DEFAULT 'PENDING',
    "last_error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warranty_activation_request_source_idx" ON "warranty_activation_request"("source");

-- CreateIndex
CREATE INDEX "warranty_activation_request_created_by_id_idx" ON "warranty_activation_request"("created_by_id");

-- CreateIndex
CREATE INDEX "warranty_activation_request_customer_id_idx" ON "warranty_activation_request"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_certificate_certificate_number_key" ON "warranty_certificate"("certificate_number");

-- CreateIndex
CREATE INDEX "warranty_certificate_warranty_id_idx" ON "warranty_certificate"("warranty_id");

-- CreateIndex
CREATE INDEX "warranty_certificate_certificate_number_idx" ON "warranty_certificate"("certificate_number");

-- CreateIndex
CREATE INDEX "warranty_certificate_status_idx" ON "warranty_certificate"("status");

-- CreateIndex
CREATE INDEX "warranty_certificate_email_status_idx" ON "warranty_certificate"("email_status");

-- CreateIndex
CREATE INDEX "warranty_certificate_recipient_email_idx" ON "warranty_certificate"("recipient_email");

-- AddForeignKey
ALTER TABLE "warranty_activation_request" ADD CONSTRAINT "warranty_activation_request_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_activation_request" ADD CONSTRAINT "warranty_activation_request_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_certificate" ADD CONSTRAINT "warranty_certificate_warranty_id_fkey" FOREIGN KEY ("warranty_id") REFERENCES "warranty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
