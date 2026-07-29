ALTER TYPE "permission_key" ADD VALUE IF NOT EXISTS 'WARRANTY_VOID';

ALTER TABLE "warranty"
ADD COLUMN "activated_by_id" UUID,
ADD COLUMN "voided_at" TIMESTAMP(3),
ADD COLUMN "voided_by_id" UUID,
ADD COLUMN "void_reason" TEXT;

CREATE INDEX "warranty_activated_by_id_idx" ON "warranty"("activated_by_id");
CREATE INDEX "warranty_voided_by_id_idx" ON "warranty"("voided_by_id");
CREATE INDEX "warranty_voided_at_idx" ON "warranty"("voided_at");

ALTER TABLE "warranty"
ADD CONSTRAINT "warranty_activated_by_id_fkey"
FOREIGN KEY ("activated_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "warranty"
ADD CONSTRAINT "warranty_voided_by_id_fkey"
FOREIGN KEY ("voided_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
