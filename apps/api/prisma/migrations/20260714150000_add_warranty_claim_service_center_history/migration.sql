-- CreateTable
CREATE TABLE "warranty_claim_service_center_history" (
    "id" UUID NOT NULL,
    "warranty_claim_id" UUID NOT NULL,
    "from_service_center_id" UUID,
    "from_service_center_name" TEXT,
    "to_service_center_id" UUID NOT NULL,
    "to_service_center_name" TEXT NOT NULL,
    "note" TEXT,
    "changed_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_claim_service_center_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warranty_claim_service_center_history_warranty_claim_id_created_at_idx"
ON "warranty_claim_service_center_history"("warranty_claim_id", "created_at");

-- CreateIndex
CREATE INDEX "warranty_claim_service_center_history_from_service_center_id_idx"
ON "warranty_claim_service_center_history"("from_service_center_id");

-- CreateIndex
CREATE INDEX "warranty_claim_service_center_history_to_service_center_id_idx"
ON "warranty_claim_service_center_history"("to_service_center_id");

-- CreateIndex
CREATE INDEX "warranty_claim_service_center_history_changed_by_user_id_idx"
ON "warranty_claim_service_center_history"("changed_by_user_id");

-- AddForeignKey
ALTER TABLE "warranty_claim_service_center_history"
ADD CONSTRAINT "warranty_claim_service_center_history_warranty_claim_id_fkey"
FOREIGN KEY ("warranty_claim_id") REFERENCES "warranty_claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim_service_center_history"
ADD CONSTRAINT "warranty_claim_service_center_history_from_service_center_id_fkey"
FOREIGN KEY ("from_service_center_id") REFERENCES "service_center"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim_service_center_history"
ADD CONSTRAINT "warranty_claim_service_center_history_to_service_center_id_fkey"
FOREIGN KEY ("to_service_center_id") REFERENCES "service_center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim_service_center_history"
ADD CONSTRAINT "warranty_claim_service_center_history_changed_by_user_id_fkey"
FOREIGN KEY ("changed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
