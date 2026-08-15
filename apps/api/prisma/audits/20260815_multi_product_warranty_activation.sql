-- Run after the multi-product warranty activation migration on a production copy.
-- psql must use ON_ERROR_STOP=1 so any failed invariant stops the rollout.

WITH rollout_audit AS (
  SELECT
    (
      SELECT COUNT(*)
      FROM "warranty_activation_request"
      WHERE "product_id" IS NOT NULL
    ) AS legacy_request_count,
    (
      SELECT COUNT(*)
      FROM "warranty_activation_request" AS "request"
      WHERE "request"."product_id" IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM "warranty_activation_request_item" AS "item"
          WHERE "item"."request_id" = "request"."id"
            AND "item"."product_id" = "request"."product_id"
        )
    ) AS backfilled_request_count,
    (
      SELECT COUNT(*)
      FROM "warranty_activation_request_item"
    ) AS item_count,
    (
      SELECT COUNT(*)
      FROM "warranty_activation_request" AS "request"
      WHERE "request"."product_id" IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM "warranty"
          WHERE "warranty"."product_id" = "request"."product_id"
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "warranty_activation_request_item" AS "item"
          WHERE "item"."request_id" = "request"."id"
            AND "item"."product_id" = "request"."product_id"
        )
    ) AS request_without_item_count,
    (
      SELECT COUNT(*)
      FROM (
        SELECT "product_id"
        FROM "warranty_activation_request_item"
        WHERE "status" IN ('PENDING', 'APPROVED')
        GROUP BY "product_id"
        HAVING COUNT(*) > 1
      ) AS "duplicate_open_products"
    ) AS duplicate_open_product_count
)
SELECT * FROM rollout_audit;

DO $$
DECLARE
  request_without_item_count BIGINT;
  duplicate_open_product_count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO request_without_item_count
  FROM "warranty_activation_request" AS "request"
  WHERE "request"."product_id" IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM "warranty"
      WHERE "warranty"."product_id" = "request"."product_id"
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "warranty_activation_request_item" AS "item"
      WHERE "item"."request_id" = "request"."id"
        AND "item"."product_id" = "request"."product_id"
    );

  SELECT COUNT(*)
  INTO duplicate_open_product_count
  FROM (
    SELECT "product_id"
    FROM "warranty_activation_request_item"
    WHERE "status" IN ('PENDING', 'APPROVED')
    GROUP BY "product_id"
    HAVING COUNT(*) > 1
  ) AS "duplicate_open_products";

  IF request_without_item_count > 0 THEN
    RAISE EXCEPTION
      'Multi-product activation audit failed: % resolvable requests have no matching item',
      request_without_item_count;
  END IF;

  IF duplicate_open_product_count > 0 THEN
    RAISE EXCEPTION
      'Multi-product activation audit failed: % products occur in multiple open request items',
      duplicate_open_product_count;
  END IF;
END
$$;
