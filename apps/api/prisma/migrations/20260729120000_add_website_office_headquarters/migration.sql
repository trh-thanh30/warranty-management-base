ALTER TABLE "website_office"
ADD COLUMN "is_headquarters" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "website_office_one_headquarters_per_revision"
ON "website_office" ("revision_id")
WHERE "is_headquarters" = true;
