ALTER TABLE "website_site_revision"
ADD COLUMN "homepage_content" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN "homepage_about_image_asset_id" UUID,
ADD COLUMN "homepage_sputter_chamber_asset_id" UUID,
ADD COLUMN "homepage_sputter_structure_asset_id" UUID;

CREATE INDEX "website_site_revision_homepage_about_image_asset_id_idx"
ON "website_site_revision"("homepage_about_image_asset_id");

CREATE INDEX "website_site_revision_homepage_sputter_chamber_asset_id_idx"
ON "website_site_revision"("homepage_sputter_chamber_asset_id");

CREATE INDEX "website_site_revision_homepage_sputter_structure_asset_id_idx"
ON "website_site_revision"("homepage_sputter_structure_asset_id");

ALTER TABLE "website_site_revision"
ADD CONSTRAINT "website_site_revision_homepage_about_image_asset_id_fkey"
FOREIGN KEY ("homepage_about_image_asset_id") REFERENCES "asset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "website_site_revision"
ADD CONSTRAINT "website_site_revision_homepage_sputter_chamber_asset_id_fkey"
FOREIGN KEY ("homepage_sputter_chamber_asset_id") REFERENCES "asset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "website_site_revision"
ADD CONSTRAINT "website_site_revision_homepage_sputter_structure_asset_id_fkey"
FOREIGN KEY ("homepage_sputter_structure_asset_id") REFERENCES "asset"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
