-- Backfill warranties created through multi-item activation requests. Only the
-- first issued warranty was available through activated_warranty_id.

-- Product is now catalogue data. Reservation is enforced by activation code
-- when a code is required; code-less categories may issue independent
-- warranties for the same catalogue product concurrently.
DROP INDEX IF EXISTS "warranty_activation_request_one_open_per_product";
DROP INDEX IF EXISTS "warranty_activation_request_item_one_open_per_product";

UPDATE "warranty" AS w
SET "dealer_id" = request."dealer_id"
FROM "warranty_activation_request_item" AS item
JOIN "warranty_activation_request" AS request
  ON request."id" = item."request_id"
WHERE item."warranty_id" = w."id"
  AND w."dealer_id" IS NULL
  AND request."dealer_id" IS NOT NULL;

INSERT INTO "warranty_ownership" (
  "warranty_id", "customer_id", "owner_user_id", "purchase_date",
  "activated_at", "is_current_owner", "updated_at"
)
SELECT
  w."id", request."customer_id", customer."user_id", w."start_date",
  w."start_date", true, CURRENT_TIMESTAMP
FROM "warranty" AS w
JOIN "warranty_activation_request_item" AS item
  ON item."warranty_id" = w."id"
JOIN "warranty_activation_request" AS request
  ON request."id" = item."request_id"
JOIN "customer" AS customer
  ON customer."id" = request."customer_id"
WHERE NOT EXISTS (
  SELECT 1
  FROM "warranty_ownership" AS ownership
  WHERE ownership."warranty_id" = w."id"
);

-- Normalize legacy duplicates before enforcing the domain invariant.
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "warranty_id"
      ORDER BY "created_at" DESC, "id" DESC
    ) AS position
  FROM "warranty_ownership"
  WHERE "is_current_owner" = true
)
UPDATE "warranty_ownership" AS ownership
SET
  "is_current_owner" = false,
  "ended_at" = COALESCE(ownership."ended_at", CURRENT_TIMESTAMP),
  "updated_at" = CURRENT_TIMESTAMP
FROM ranked
WHERE ownership."id" = ranked."id"
  AND ranked.position > 1;

CREATE UNIQUE INDEX "warranty_ownership_one_current_owner_key"
  ON "warranty_ownership"("warranty_id")
  WHERE "is_current_owner" = true;

-- Product is catalogue data. Serial/VIN belongs to the issued Warranty.
DROP INDEX IF EXISTS "product_serial_number_key";
DROP INDEX IF EXISTS "product_serial_number_idx";
ALTER TABLE "product" DROP COLUMN "serial_number";
