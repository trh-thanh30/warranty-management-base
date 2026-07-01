-- CreateEnum
CREATE TYPE "product_category" AS ENUM ('CAR', 'ACCESSORY', 'SPARE_PART', 'SERVICE_PACKAGE');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "warranty_status" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'VOIDED');

-- CreateTable
CREATE TABLE "customer" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "customer_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "product_code" TEXT NOT NULL,
    "warranty_code" TEXT NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "category" "product_category" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "manufacture_year" INTEGER,
    "description" TEXT,
    "status" "product_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ownership" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "purchase_date" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "is_current_owner" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_ownership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "warranty_code" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "duration_months" INTEGER NOT NULL,
    "status" "warranty_status" NOT NULL DEFAULT 'DRAFT',
    "terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_id_key" ON "customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_customer_code_key" ON "customer"("customer_code");

-- CreateIndex
CREATE INDEX "customer_customer_code_idx" ON "customer"("customer_code");

-- CreateIndex
CREATE INDEX "customer_full_name_idx" ON "customer"("full_name");

-- CreateIndex
CREATE INDEX "customer_phone_idx" ON "customer"("phone");

-- CreateIndex
CREATE INDEX "customer_email_idx" ON "customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_product_code_key" ON "product"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_warranty_code_key" ON "product"("warranty_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_serial_number_key" ON "product"("serial_number");

-- CreateIndex
CREATE INDEX "product_category_idx" ON "product"("category");

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");

-- CreateIndex
CREATE INDEX "product_warranty_code_idx" ON "product"("warranty_code");

-- CreateIndex
CREATE INDEX "product_serial_number_idx" ON "product"("serial_number");

-- CreateIndex
CREATE INDEX "product_name_idx" ON "product"("name");

-- CreateIndex
CREATE INDEX "product_ownership_product_id_is_current_owner_idx" ON "product_ownership"("product_id", "is_current_owner");

-- CreateIndex
CREATE INDEX "product_ownership_customer_id_is_current_owner_idx" ON "product_ownership"("customer_id", "is_current_owner");

-- CreateIndex
CREATE INDEX "product_ownership_owner_user_id_is_current_owner_idx" ON "product_ownership"("owner_user_id", "is_current_owner");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_product_id_key" ON "warranty"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_warranty_code_key" ON "warranty"("warranty_code");

-- CreateIndex
CREATE INDEX "warranty_warranty_code_idx" ON "warranty"("warranty_code");

-- CreateIndex
CREATE INDEX "warranty_status_idx" ON "warranty"("status");

-- CreateIndex
CREATE INDEX "warranty_end_date_idx" ON "warranty"("end_date");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ownership" ADD CONSTRAINT "product_ownership_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ownership" ADD CONSTRAINT "product_ownership_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ownership" ADD CONSTRAINT "product_ownership_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty" ADD CONSTRAINT "warranty_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
