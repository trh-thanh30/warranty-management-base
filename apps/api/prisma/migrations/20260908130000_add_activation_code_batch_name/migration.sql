ALTER TABLE "activation_code_batch"
ADD COLUMN "batch_name" TEXT;

UPDATE "activation_code_batch"
SET "batch_name" = "batch_code"
WHERE "batch_name" IS NULL;

ALTER TABLE "activation_code_batch"
ALTER COLUMN "batch_name" SET NOT NULL;
