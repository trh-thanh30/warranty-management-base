-- Keep Product.current_warranty_id aligned with the latest active warranty.
-- The activation review flow previously created and activated Warranty rows
-- without updating this compatibility pointer, causing product reads to show
-- no warranty and allowing an already-activated product to be selected again.

UPDATE "product" AS "product"
SET "current_warranty_id" = "latest_active_warranty"."id"
FROM (
  SELECT DISTINCT ON ("product_id")
    "id",
    "product_id"
  FROM "warranty"
  WHERE "status" = 'ACTIVE'
  ORDER BY
    "product_id",
    "start_date" DESC NULLS LAST,
    "created_at" DESC,
    "id" DESC
) AS "latest_active_warranty"
WHERE "product"."id" = "latest_active_warranty"."product_id"
  AND "product"."current_warranty_id" IS DISTINCT FROM "latest_active_warranty"."id";
