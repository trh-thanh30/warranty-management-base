-- Reconcile requests created before activation-code reservation became a
-- first-class lifecycle transition. Only valid, unambiguous open requests are
-- promoted; every skipped reference is reported for manual review.

DO $$
DECLARE
  skipped_count INTEGER;
BEGIN
  WITH open_code_references AS (
    SELECT "activation_code_id" AS code_id, "id" AS request_id
    FROM "warranty_activation_request"
    WHERE "activation_code_id" IS NOT NULL
      AND "status" IN ('PENDING', 'APPROVED')

    UNION ALL

    SELECT "activation_code_id" AS code_id, "request_id"
    FROM "warranty_activation_request_item"
    WHERE "activation_code_id" IS NOT NULL
      AND "status" IN ('PENDING', 'APPROVED')
  ), reference_counts AS (
    SELECT code_id, COUNT(DISTINCT request_id) AS request_count
    FROM open_code_references
    GROUP BY code_id
  )
  SELECT COUNT(*)
  INTO skipped_count
  FROM reference_counts AS refs
  JOIN "activation_code" AS code ON code."id" = refs.code_id
  WHERE code."status" <> 'AVAILABLE'
     OR code."expires_at" <= NOW()
     OR refs.request_count <> 1;

  IF skipped_count > 0 THEN
    RAISE NOTICE '% activation code(s) linked to open requests were not reconciled; review expired, conflicting, or terminal records manually', skipped_count;
  END IF;
END $$;

WITH open_code_references AS (
  SELECT "activation_code_id" AS code_id, "id" AS request_id
  FROM "warranty_activation_request"
  WHERE "activation_code_id" IS NOT NULL
    AND "status" IN ('PENDING', 'APPROVED')

  UNION ALL

  SELECT "activation_code_id" AS code_id, "request_id"
  FROM "warranty_activation_request_item"
  WHERE "activation_code_id" IS NOT NULL
    AND "status" IN ('PENDING', 'APPROVED')
), unambiguous_codes AS (
  SELECT code_id
  FROM open_code_references
  GROUP BY code_id
  HAVING COUNT(DISTINCT request_id) = 1
)
UPDATE "activation_code" AS code
SET "status" = 'PENDING_APPROVAL', "updated_at" = NOW()
FROM unambiguous_codes AS pending
WHERE code."id" = pending.code_id
  AND code."status" = 'AVAILABLE'
  AND code."expires_at" > NOW();
