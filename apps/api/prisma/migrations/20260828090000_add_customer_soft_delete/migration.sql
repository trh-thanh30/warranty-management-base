ALTER TABLE "customer" ADD COLUMN "deleted_at" TIMESTAMP(3);

CREATE INDEX "customer_deleted_at_idx" ON "customer"("deleted_at");
