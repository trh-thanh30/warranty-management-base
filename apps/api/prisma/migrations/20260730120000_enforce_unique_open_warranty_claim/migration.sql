CREATE UNIQUE INDEX "warranty_claim_open_warranty_unique"
ON "warranty_claim" ("warranty_id")
WHERE "status" IN ('SUBMITTED', 'REVIEWING', 'APPROVED', 'IN_REPAIR');
