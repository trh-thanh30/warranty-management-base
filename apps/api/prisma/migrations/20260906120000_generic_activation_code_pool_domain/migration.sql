-- Expand the existing product-bound activation flow into a generic code pool.
-- Legacy batch snapshots and relations remain readable during the cut-over.

ALTER TABLE "category"
  ADD COLUMN "activation_code_enabled" BOOLEAN NOT NULL DEFAULT true;

DROP INDEX "customer_email_key";
-- customer_email_idx is created by the original warranty-domain migration.
-- Keep and reuse that non-unique lookup index after dropping the unique index.

ALTER TABLE "dealer" ADD COLUMN "email" TEXT;
CREATE INDEX "dealer_email_idx" ON "dealer"("email");

ALTER TABLE "product"
  ADD COLUMN "current_warranty_id" UUID,
  ADD COLUMN "warranty_duration_months" INTEGER,
  ADD COLUMN "warranty_method" "warranty_method",
  ADD COLUMN "warranty_terms" TEXT;

-- Preserve the current product policy before Warranty becomes issuance history.
UPDATE "product" AS "product"
SET
  "warranty_duration_months" = "policy"."duration_months",
  "warranty_method" = "policy"."method",
  "warranty_terms" = "policy"."terms"
FROM "warranty" AS "policy"
WHERE "policy"."product_id" = "product"."id";

UPDATE "product" AS "product"
SET "current_warranty_id" = "warranty"."id"
FROM "warranty" AS "warranty"
WHERE "warranty"."product_id" = "product"."id";

CREATE UNIQUE INDEX "product_current_warranty_id_key"
  ON "product"("current_warranty_id");

ALTER TABLE "product"
  ADD CONSTRAINT "product_current_warranty_id_fkey"
  FOREIGN KEY ("current_warranty_id") REFERENCES "warranty"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "activation_code_batch"
  ALTER COLUMN "product_sku" DROP NOT NULL,
  ALTER COLUMN "product_name" DROP NOT NULL,
  ALTER COLUMN "warranty_duration_months" DROP NOT NULL,
  ALTER COLUMN "warranty_method" DROP NOT NULL;

DROP INDEX "warranty_product_id_key";
CREATE INDEX "warranty_product_id_idx" ON "warranty"("product_id");

DROP INDEX "activation_code_product_id_key";
CREATE INDEX "activation_code_product_id_idx" ON "activation_code"("product_id");

ALTER TABLE "warranty"
  ADD COLUMN "activation_code_id" UUID;

-- Existing approved requests already identify the activation code that issued a
-- warranty. Backfill only unambiguous links and leave legacy manual warranties null.
UPDATE "warranty" AS "warranty"
SET "activation_code_id" = "request"."activation_code_id"
FROM "warranty_activation_request" AS "request"
WHERE "request"."activated_warranty_id" = "warranty"."id"
  AND "request"."activation_code_id" IS NOT NULL;

CREATE UNIQUE INDEX "warranty_activation_code_id_key"
  ON "warranty"("activation_code_id");

ALTER TABLE "warranty"
  ADD CONSTRAINT "warranty_activation_code_id_fkey"
  FOREIGN KEY ("activation_code_id") REFERENCES "activation_code"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request_item"
  ADD COLUMN "activation_code_id" UUID,
  ALTER COLUMN "warranty_id" DROP NOT NULL,
  ALTER COLUMN "warranty_code" DROP NOT NULL;

-- The legacy request-level code represented the primary product. Move that
-- association to its matching item when one exists.
UPDATE "warranty_activation_request_item" AS "item"
SET "activation_code_id" = "request"."activation_code_id"
FROM "warranty_activation_request" AS "request"
WHERE "item"."request_id" = "request"."id"
  AND "item"."product_id" = "request"."product_id"
  AND "request"."activation_code_id" IS NOT NULL;

DROP INDEX "warranty_activation_request_item_request_id_product_id_key";

CREATE INDEX "warranty_activation_request_item_activation_code_id_status_idx"
  ON "warranty_activation_request_item"("activation_code_id", "status");

-- Rejected/cancelled history may retain a code, but only one open or completed
-- request item may own it at a time.
CREATE UNIQUE INDEX "warranty_activation_request_item_one_live_per_code"
  ON "warranty_activation_request_item"("activation_code_id")
  WHERE "activation_code_id" IS NOT NULL
    AND "status" IN ('PENDING', 'APPROVED', 'ACTIVATED');

ALTER TABLE "warranty_activation_request_item"
  ADD CONSTRAINT "warranty_activation_request_item_activation_code_id_fkey"
  FOREIGN KEY ("activation_code_id") REFERENCES "activation_code"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
