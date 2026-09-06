-- Product is a physical unit: retain one assignment per product before
-- restoring the one-to-one database invariant. Null values remain unrestricted.
WITH "ranked_assignments" AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "product_id"
      ORDER BY
        CASE WHEN "status" = 'ACTIVATED' THEN 0 ELSE 1 END,
        "created_at" ASC,
        "id" ASC
    ) AS "assignment_rank"
  FROM "activation_code"
  WHERE "product_id" IS NOT NULL
)
UPDATE "activation_code"
SET "product_id" = NULL
WHERE "id" IN (
  SELECT "id"
  FROM "ranked_assignments"
  WHERE "assignment_rank" > 1
);

DROP INDEX IF EXISTS "activation_code_product_id_idx";
CREATE UNIQUE INDEX "activation_code_product_id_key"
  ON "activation_code"("product_id");
