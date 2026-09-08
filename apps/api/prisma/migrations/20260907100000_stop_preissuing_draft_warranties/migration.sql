-- Product stores the warranty policy. A Warranty is issued only after a
-- successful activation, so remove unused draft records created by the old
-- product-creation flow while preserving every record with operational data.

-- Product.current_warranty_id uses ON DELETE SET NULL, so deleting a safe
-- draft also clears the legacy compatibility pointer atomically. Avoid a
-- temporary table here because Prisma may commit between migration statements.
DELETE FROM "warranty"
WHERE "warranty"."status" = 'DRAFT'
  AND "warranty"."activation_code_id" IS NULL
  AND "warranty"."start_date" IS NULL
  AND "warranty"."end_date" IS NULL
  AND "warranty"."activated_by_id" IS NULL
  AND "warranty"."voided_at" IS NULL
  AND "warranty"."voided_by_id" IS NULL
  AND "warranty"."void_reason" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "warranty_activation_request"
    WHERE "warranty_activation_request"."activated_warranty_id" = "warranty"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "warranty_activation_request_item"
    WHERE "warranty_activation_request_item"."warranty_id" = "warranty"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "warranty_certificate"
    WHERE "warranty_certificate"."warranty_id" = "warranty"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "warranty_claim"
    WHERE "warranty_claim"."warranty_id" = "warranty"."id"
  );
