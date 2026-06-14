-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'STAFF', 'USER');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "asset_type" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER', 'THUMBNAIL', 'BANNER');

-- CreateEnum
CREATE TYPE "asset_access_type" AS ENUM ('PUBLIC', 'PRIVATE', 'TEMP');

-- CreateEnum
CREATE TYPE "notification_source" AS ENUM ('ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "notification_scope" AS ENUM ('ALL', 'ROLE', 'USER');

-- CreateEnum
CREATE TYPE "notification_delivery_status" AS ENUM ('SCHEDULED', 'SENT');

-- CreateEnum
CREATE TYPE "notification_read_status" AS ENUM ('UNREAD', 'READ');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "access_type" "asset_access_type" NOT NULL DEFAULT 'PUBLIC',
    "type" "asset_type" NOT NULL DEFAULT 'OTHER',
    "folder" TEXT,
    "metadata" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_link" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" "notification_source" NOT NULL DEFAULT 'SYSTEM',
    "scope" "notification_scope" NOT NULL,
    "delivery_status" "notification_delivery_status" NOT NULL DEFAULT 'SENT',
    "metadata" JSONB,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_recipient" (
    "id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "notification_read_status" NOT NULL DEFAULT 'UNREAD',
    "read_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" UUID NOT NULL,
    "admin_id" UUID,
    "admin_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE INDEX "user_role_status_idx" ON "user"("role", "status");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "asset_access_type_idx" ON "asset"("access_type");

-- CreateIndex
CREATE INDEX "asset_type_idx" ON "asset"("type");

-- CreateIndex
CREATE INDEX "asset_uploaded_by_id_idx" ON "asset"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "asset_is_deleted_idx" ON "asset"("is_deleted");

-- CreateIndex
CREATE INDEX "asset_created_at_idx" ON "asset"("created_at");

-- CreateIndex
CREATE INDEX "asset_link_entity_id_entity_type_idx" ON "asset_link"("entity_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "asset_link_asset_id_entity_id_entity_type_key" ON "asset_link"("asset_id", "entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "notification"("type");

-- CreateIndex
CREATE INDEX "notification_source_idx" ON "notification"("source");

-- CreateIndex
CREATE INDEX "notification_scope_idx" ON "notification"("scope");

-- CreateIndex
CREATE INDEX "notification_delivery_status_scheduled_at_idx" ON "notification"("delivery_status", "scheduled_at");

-- CreateIndex
CREATE INDEX "notification_created_at_idx" ON "notification"("created_at");

-- CreateIndex
CREATE INDEX "notification_recipient_user_id_status_created_at_idx" ON "notification_recipient"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "notification_recipient_notification_id_idx" ON "notification_recipient"("notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipient_notification_id_user_id_key" ON "notification_recipient"("notification_id", "user_id");

-- CreateIndex
CREATE INDEX "activity_log_created_at_idx" ON "activity_log"("created_at");

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_link" ADD CONSTRAINT "asset_link_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
