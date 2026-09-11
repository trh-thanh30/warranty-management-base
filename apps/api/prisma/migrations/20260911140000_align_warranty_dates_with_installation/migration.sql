-- Repair legacy single-item activation requests whose warranty period was
-- calculated from the review time instead of the recorded installation time.
-- Matching start_date to reviewed_at avoids overwriting manually corrected rows.
UPDATE "warranty" AS "w"
SET
  "start_date" = "request"."installed_at",
  "end_date" = "request"."installed_at" + make_interval(months => "w"."duration_months"),
  "updated_at" = CURRENT_TIMESTAMP
FROM "warranty_activation_request" AS "request"
WHERE "request"."activated_warranty_id" = "w"."id"
  AND "request"."installed_at" IS NOT NULL
  AND "request"."reviewed_at" IS NOT NULL
  AND "w"."start_date" = "request"."reviewed_at";

-- Repair warranties linked through multi-item activation requests using the
-- same conservative guard as the legacy single-item relation above.
UPDATE "warranty" AS "w"
SET
  "start_date" = "request"."installed_at",
  "end_date" = "request"."installed_at" + make_interval(months => "w"."duration_months"),
  "updated_at" = CURRENT_TIMESTAMP
FROM "warranty_activation_request_item" AS "item"
JOIN "warranty_activation_request" AS "request"
  ON "request"."id" = "item"."request_id"
WHERE "item"."warranty_id" = "w"."id"
  AND "request"."installed_at" IS NOT NULL
  AND "request"."reviewed_at" IS NOT NULL
  AND "w"."start_date" = "request"."reviewed_at";
