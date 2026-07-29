-- Add versioned homepage hero slides with separate desktop and mobile assets.
CREATE TABLE "website_hero_slide" (
    "id" UUID NOT NULL,
    "revision_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "desktop_asset_id" UUID,
    "mobile_asset_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_hero_slide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "website_hero_slide_revision_id_key_key"
ON "website_hero_slide"("revision_id", "key");

CREATE INDEX "website_hero_slide_revision_id_is_active_sort_order_idx"
ON "website_hero_slide"("revision_id", "is_active", "sort_order");

CREATE INDEX "website_hero_slide_desktop_asset_id_idx"
ON "website_hero_slide"("desktop_asset_id");

CREATE INDEX "website_hero_slide_mobile_asset_id_idx"
ON "website_hero_slide"("mobile_asset_id");

ALTER TABLE "website_hero_slide"
ADD CONSTRAINT "website_hero_slide_revision_id_fkey"
FOREIGN KEY ("revision_id") REFERENCES "website_site_revision"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "website_hero_slide"
ADD CONSTRAINT "website_hero_slide_desktop_asset_id_fkey"
FOREIGN KEY ("desktop_asset_id") REFERENCES "asset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "website_hero_slide"
ADD CONSTRAINT "website_hero_slide_mobile_asset_id_fkey"
FOREIGN KEY ("mobile_asset_id") REFERENCES "asset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
