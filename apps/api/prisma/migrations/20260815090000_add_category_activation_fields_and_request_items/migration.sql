-- Expand category activation configuration into first-class relational data.
CREATE TYPE "category_activation_field_type" AS ENUM (
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'DATE',
  'SELECT',
  'PRODUCT_SELECT'
);

ALTER TABLE "category"
ADD COLUMN "activation_form_enabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "category_activation_field" (
  "id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "type" "category_activation_field_type" NOT NULL,
  "placeholder" TEXT,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "category_activation_field_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "category_activation_field_option" (
  "id" UUID NOT NULL,
  "field_id" UUID NOT NULL,
  "label" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "category_activation_field_option_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "warranty_activation_request_item" (
  "id" UUID NOT NULL,
  "request_id" UUID NOT NULL,
  "activation_field_id" UUID,
  "position_key" TEXT NOT NULL,
  "position_label" TEXT NOT NULL,
  "product_id" UUID NOT NULL,
  "warranty_id" UUID NOT NULL,
  "warranty_code" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "product_code" TEXT NOT NULL,
  "serial_number" TEXT,
  "status" "warranty_activation_request_status" NOT NULL DEFAULT 'PENDING',
  "activated_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "warranty_activation_request_item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "category_activation_field_category_id_key_key"
ON "category_activation_field"("category_id", "key");

CREATE INDEX "category_activation_field_category_id_is_active_sort_order_idx"
ON "category_activation_field"("category_id", "is_active", "sort_order");

CREATE UNIQUE INDEX "category_activation_field_option_field_id_value_key"
ON "category_activation_field_option"("field_id", "value");

CREATE INDEX "category_activation_field_option_field_id_sort_order_idx"
ON "category_activation_field_option"("field_id", "sort_order");

CREATE UNIQUE INDEX "warranty_activation_request_item_request_id_position_key_key"
ON "warranty_activation_request_item"("request_id", "position_key");

CREATE UNIQUE INDEX "warranty_activation_request_item_request_id_product_id_key"
ON "warranty_activation_request_item"("request_id", "product_id");

CREATE INDEX "warranty_activation_request_item_request_id_status_idx"
ON "warranty_activation_request_item"("request_id", "status");

CREATE INDEX "warranty_activation_request_item_product_id_status_idx"
ON "warranty_activation_request_item"("product_id", "status");

CREATE INDEX "warranty_activation_request_item_warranty_id_idx"
ON "warranty_activation_request_item"("warranty_id");

ALTER TABLE "category_activation_field"
ADD CONSTRAINT "category_activation_field_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "category"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category_activation_field_option"
ADD CONSTRAINT "category_activation_field_option_field_id_fkey"
FOREIGN KEY ("field_id") REFERENCES "category_activation_field"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request_item"
ADD CONSTRAINT "warranty_activation_request_item_request_id_fkey"
FOREIGN KEY ("request_id") REFERENCES "warranty_activation_request"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request_item"
ADD CONSTRAINT "warranty_activation_request_item_activation_field_id_fkey"
FOREIGN KEY ("activation_field_id") REFERENCES "category_activation_field"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request_item"
ADD CONSTRAINT "warranty_activation_request_item_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "product"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "warranty_activation_request_item"
ADD CONSTRAINT "warranty_activation_request_item_warranty_id_fkey"
FOREIGN KEY ("warranty_id") REFERENCES "warranty"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve the existing enablement flag. A category with an existing field
-- array but no explicit flag follows the old runtime behavior and is enabled.
UPDATE "category"
SET "activation_form_enabled" = CASE
  WHEN jsonb_typeof("metadata" -> 'activationFieldsEnabled') = 'boolean'
    THEN ("metadata" ->> 'activationFieldsEnabled')::boolean
  WHEN jsonb_typeof("metadata" -> 'activationFields') = 'array'
    THEN true
  ELSE false
END
WHERE "metadata" IS NOT NULL;

-- Copy valid activation fields from category metadata. gen_random_uuid() is
-- already used by existing production migrations in this repository.
WITH "legacy_fields" AS (
  SELECT
    "category"."id" AS "category_id",
    "entry"."value" AS "field",
    "entry"."ordinality" AS "ordinality"
  FROM "category"
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof("category"."metadata" -> 'activationFields') = 'array'
        THEN "category"."metadata" -> 'activationFields'
      ELSE '[]'::jsonb
    END
  ) WITH ORDINALITY AS "entry"("value", "ordinality")
)
INSERT INTO "category_activation_field" (
  "id",
  "category_id",
  "key",
  "label",
  "type",
  "placeholder",
  "required",
  "sort_order",
  "is_active"
)
SELECT
  gen_random_uuid(),
  "category_id",
  btrim("field" ->> 'key'),
  btrim("field" ->> 'label'),
  ("field" ->> 'type')::"category_activation_field_type",
  NULLIF(btrim("field" ->> 'placeholder'), ''),
  CASE
    WHEN jsonb_typeof("field" -> 'required') = 'boolean'
      THEN ("field" ->> 'required')::boolean
    ELSE false
  END,
  CASE
    WHEN jsonb_typeof("field" -> 'order') = 'number'
      THEN ("field" ->> 'order')::integer
    ELSE "ordinality"::integer
  END,
  true
FROM "legacy_fields"
WHERE
  NULLIF(btrim("field" ->> 'key'), '') IS NOT NULL
  AND NULLIF(btrim("field" ->> 'label'), '') IS NOT NULL
  AND ("field" ->> 'type') IN (
    'TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'PRODUCT_SELECT'
  )
ON CONFLICT ("category_id", "key") DO NOTHING;

-- Preserve static SELECT options. PRODUCT_SELECT deliberately has no options.
WITH "legacy_field_options" AS (
  SELECT
    "category"."id" AS "category_id",
    btrim("field_entry"."value" ->> 'key') AS "field_key",
    "option_entry"."value" AS "option",
    "option_entry"."ordinality" AS "ordinality"
  FROM "category"
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof("category"."metadata" -> 'activationFields') = 'array'
        THEN "category"."metadata" -> 'activationFields'
      ELSE '[]'::jsonb
    END
  ) AS "field_entry"("value")
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN
        "field_entry"."value" ->> 'type' = 'SELECT'
        AND jsonb_typeof("field_entry"."value" -> 'options') = 'array'
        THEN "field_entry"."value" -> 'options'
      ELSE '[]'::jsonb
    END
  ) WITH ORDINALITY AS "option_entry"("value", "ordinality")
)
INSERT INTO "category_activation_field_option" (
  "id",
  "field_id",
  "label",
  "value",
  "sort_order"
)
SELECT
  gen_random_uuid(),
  "field"."id",
  btrim("legacy"."option" ->> 'label'),
  btrim(COALESCE("legacy"."option" ->> 'value', "legacy"."option" ->> 'label')),
  "legacy"."ordinality"::integer
FROM "legacy_field_options" AS "legacy"
JOIN "category_activation_field" AS "field"
  ON "field"."category_id" = "legacy"."category_id"
  AND "field"."key" = "legacy"."field_key"
  AND "field"."type" = 'SELECT'
WHERE
  NULLIF(btrim("legacy"."option" ->> 'label'), '') IS NOT NULL
  AND NULLIF(
    btrim(COALESCE("legacy"."option" ->> 'value', "legacy"."option" ->> 'label')),
    ''
  ) IS NOT NULL
ON CONFLICT ("field_id", "value") DO NOTHING;

-- Backfill one primaryProduct item for each legacy request that still resolves
-- to a physical Product and Warranty. Singular request columns remain intact.
INSERT INTO "warranty_activation_request_item" (
  "id",
  "request_id",
  "position_key",
  "position_label",
  "product_id",
  "warranty_id",
  "warranty_code",
  "product_name",
  "product_code",
  "serial_number",
  "status",
  "activated_at"
)
SELECT
  gen_random_uuid(),
  "request"."id",
  'primaryProduct',
  'Sản phẩm chính',
  "product"."id",
  "warranty"."id",
  COALESCE("warranty"."warranty_code", "request"."warranty_code"),
  COALESCE(
    "request"."product_name",
    "product"."display_name",
    "template"."name"
  ),
  "product"."product_code",
  COALESCE("request"."serial_number", "product"."serial_number"),
  "request"."status",
  CASE
    WHEN "request"."status" = 'ACTIVATED'
      THEN COALESCE(
        "request"."reviewed_at",
        "warranty"."start_date",
        "request"."updated_at"
      )
    ELSE NULL
  END
FROM "warranty_activation_request" AS "request"
JOIN "product" ON "product"."id" = "request"."product_id"
JOIN "product_template" AS "template" ON "template"."id" = "product"."template_id"
JOIN "warranty" ON "warranty"."product_id" = "product"."id"
ON CONFLICT ("request_id", "product_id") DO NOTHING;

-- Fail loudly before enforcing the open-product reservation invariant.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "warranty_activation_request_item"
    WHERE "status" IN ('PENDING', 'APPROVED')
    GROUP BY "product_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one open warranty activation request item per product: duplicate open items exist';
  END IF;
END
$$;

CREATE UNIQUE INDEX
  "warranty_activation_request_item_one_open_per_product"
ON "warranty_activation_request_item" ("product_id")
WHERE "status" IN ('PENDING', 'APPROVED');
