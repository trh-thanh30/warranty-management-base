-- CreateEnum
CREATE TYPE "warranty_claim_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "warranty_claim"
ADD COLUMN "priority" "warranty_claim_priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "due_at" TIMESTAMP(3),
ADD COLUMN "sla_breached_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "warranty_claim_priority_idx" ON "warranty_claim"("priority");

-- CreateIndex
CREATE INDEX "warranty_claim_due_at_idx" ON "warranty_claim"("due_at");

-- CreateIndex
CREATE INDEX "warranty_claim_sla_breached_at_idx" ON "warranty_claim"("sla_breached_at");
