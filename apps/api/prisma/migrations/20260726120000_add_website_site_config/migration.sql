-- Website Site configuration only.

-- CreateEnum
CREATE TYPE "website_locale" AS ENUM ('VI', 'EN');

-- CreateEnum
CREATE TYPE "website_revision_state" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "website_social_platform" AS ENUM ('FACEBOOK', 'ZALO', 'TIKTOK', 'YOUTUBE', 'OTHER');

-- CreateEnum
CREATE TYPE "website_config_domain" AS ENUM ('SITE');

-- CreateEnum
CREATE TYPE "website_config_audit_action" AS ENUM ('SAVE_DRAFT', 'PUBLISH');

-- AlterEnum
ALTER TYPE "permission_key" ADD VALUE 'WEBSITE_CONFIG_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'WEBSITE_CONFIG_UPDATE';
ALTER TYPE "permission_key" ADD VALUE 'WEBSITE_CONFIG_PUBLISH';

-- CreateTable
CREATE TABLE "website_site_revision" (
    "id" UUID NOT NULL,
    "site_key" TEXT NOT NULL DEFAULT 'main',
    "state" "website_revision_state" NOT NULL DEFAULT 'DRAFT',
    "revision_number" INTEGER NOT NULL DEFAULT 1,
    "lock_version" INTEGER NOT NULL DEFAULT 1,
    "contact_email" TEXT NOT NULL DEFAULT '',
    "website_url" TEXT NOT NULL DEFAULT '',
    "header_logo_asset_id" UUID,
    "footer_logo_asset_id" UUID,
    "og_image_asset_id" UUID,
    "published_at" TIMESTAMP(3),
    "published_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_site_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_office" (
    "id" UUID NOT NULL,
    "revision_id" UUID NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_office_translation" (
    "id" UUID NOT NULL,
    "office_id" UUID NOT NULL,
    "locale" "website_locale" NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "website_office_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_social_link" (
    "id" UUID NOT NULL,
    "revision_id" UUID NOT NULL,
    "platform" "website_social_platform" NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_social_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_config_audit" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "domain" "website_config_domain" NOT NULL,
    "entity_id" TEXT,
    "site_key" TEXT NOT NULL DEFAULT 'main',
    "action" "website_config_audit_action" NOT NULL,
    "before_version" INTEGER,
    "after_version" INTEGER,
    "change_summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_config_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "website_site_revision_site_key_state_idx" ON "website_site_revision"("site_key", "state");

-- CreateIndex
CREATE INDEX "website_site_revision_site_key_revision_number_idx" ON "website_site_revision"("site_key", "revision_number");

-- CreateIndex
CREATE INDEX "website_office_revision_id_is_active_sort_order_idx" ON "website_office"("revision_id", "is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "website_office_translation_office_id_locale_key" ON "website_office_translation"("office_id", "locale");

-- CreateIndex
CREATE INDEX "website_social_link_revision_id_is_active_sort_order_idx" ON "website_social_link"("revision_id", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "website_config_audit_domain_site_key_created_at_idx" ON "website_config_audit"("domain", "site_key", "created_at");

-- CreateIndex
CREATE INDEX "website_config_audit_actor_id_idx" ON "website_config_audit"("actor_id");

-- AddForeignKey
ALTER TABLE "website_site_revision" ADD CONSTRAINT "website_site_revision_header_logo_asset_id_fkey" FOREIGN KEY ("header_logo_asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_site_revision" ADD CONSTRAINT "website_site_revision_footer_logo_asset_id_fkey" FOREIGN KEY ("footer_logo_asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_site_revision" ADD CONSTRAINT "website_site_revision_og_image_asset_id_fkey" FOREIGN KEY ("og_image_asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_site_revision" ADD CONSTRAINT "website_site_revision_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_office" ADD CONSTRAINT "website_office_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "website_site_revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_office_translation" ADD CONSTRAINT "website_office_translation_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "website_office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_social_link" ADD CONSTRAINT "website_social_link_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "website_site_revision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_config_audit" ADD CONSTRAINT "website_config_audit_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enforce a single mutable draft and a single public revision per site.
CREATE UNIQUE INDEX "website_site_revision_one_draft_per_site_key" ON "website_site_revision"("site_key") WHERE "state" = 'DRAFT';
CREATE UNIQUE INDEX "website_site_revision_one_published_per_site_key" ON "website_site_revision"("site_key") WHERE "state" = 'PUBLISHED';
