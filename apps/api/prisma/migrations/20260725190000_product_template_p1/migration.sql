ALTER TYPE "permission_key" ADD VALUE 'PRODUCT_TEMPLATE_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'PRODUCT_TEMPLATE_CREATE';
ALTER TYPE "permission_key" ADD VALUE 'PRODUCT_TEMPLATE_UPDATE';

-- P0 copied reusable COVER/GALLERY relations onto each Product. Keep genuine
-- Product overrides, and remove only relations that are byte-for-byte linked
-- to the same Asset already owned by the Product Template.
DELETE FROM "product_asset" AS pa
USING "product" AS p, "product_template_asset" AS pta
WHERE pa."product_id" = p."id"
  AND p."template_id" = pta."product_template_id"
  AND pa."asset_id" = pta."asset_id"
  AND pa."role" IN ('COVER', 'GALLERY')
  AND pta."role" = pa."role";

-- Specifications are template-owned. Preserve every other historical metadata
-- key because older installations may contain unit-specific extensions.
UPDATE "product"
SET "metadata" = NULLIF("metadata" - 'specifications', '{}'::jsonb)
WHERE "template_id" IS NOT NULL
  AND "metadata" ? 'specifications';
