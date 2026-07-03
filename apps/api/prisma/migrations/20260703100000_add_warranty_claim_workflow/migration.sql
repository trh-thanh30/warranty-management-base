-- AlterEnum
ALTER TYPE "permission_key" ADD VALUE 'SERVICE_CENTER_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'SERVICE_CENTER_CREATE';
ALTER TYPE "permission_key" ADD VALUE 'SERVICE_CENTER_UPDATE';
ALTER TYPE "permission_key" ADD VALUE 'SERVICE_CENTER_DELETE';

-- AlterTable
ALTER TABLE "warranty_claim" ADD COLUMN "service_center_id" UUID;

-- CreateTable
CREATE TABLE "service_center" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "province" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty_claim_status_history" (
    "id" UUID NOT NULL,
    "warranty_claim_id" UUID NOT NULL,
    "from_status" "warranty_claim_status",
    "to_status" "warranty_claim_status" NOT NULL,
    "note" TEXT,
    "changed_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_claim_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warranty_claim_service_center_id_idx" ON "warranty_claim"("service_center_id");

-- CreateIndex
CREATE INDEX "service_center_is_active_idx" ON "service_center"("is_active");

-- CreateIndex
CREATE INDEX "service_center_province_idx" ON "service_center"("province");

-- CreateIndex
CREATE INDEX "service_center_name_idx" ON "service_center"("name");

-- CreateIndex
CREATE INDEX "warranty_claim_status_history_warranty_claim_id_created_at_idx" ON "warranty_claim_status_history"("warranty_claim_id", "created_at");

-- CreateIndex
CREATE INDEX "warranty_claim_status_history_to_status_idx" ON "warranty_claim_status_history"("to_status");

-- CreateIndex
CREATE INDEX "warranty_claim_status_history_changed_by_user_id_idx" ON "warranty_claim_status_history"("changed_by_user_id");

-- AddForeignKey
ALTER TABLE "warranty_claim" ADD CONSTRAINT "warranty_claim_service_center_id_fkey" FOREIGN KEY ("service_center_id") REFERENCES "service_center"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim_status_history" ADD CONSTRAINT "warranty_claim_status_history_warranty_claim_id_fkey" FOREIGN KEY ("warranty_claim_id") REFERENCES "warranty_claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim_status_history" ADD CONSTRAINT "warranty_claim_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
