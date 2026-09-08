ALTER TABLE "warranty" ADD COLUMN "serial_number" TEXT;

CREATE INDEX "warranty_serial_number_idx" ON "warranty"("serial_number");

-- Preserve historical serial/VIN values on the issued warranty record.
UPDATE "warranty" AS w
SET "serial_number" = p."serial_number"
FROM "product" AS p
WHERE w."product_id" = p."id"
  AND p."serial_number" IS NOT NULL;
