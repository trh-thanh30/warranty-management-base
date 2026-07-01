-- CreateEnum
CREATE TYPE "permission_key" AS ENUM (
    'DASHBOARD_VIEW',
    'CUSTOMER_VIEW',
    'CUSTOMER_CREATE',
    'CUSTOMER_UPDATE',
    'CUSTOMER_DELETE',
    'PRODUCT_VIEW',
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE',
    'PRODUCT_ASSIGN_OWNER',
    'WARRANTY_VIEW',
    'WARRANTY_CREATE',
    'WARRANTY_UPDATE',
    'WARRANTY_ACTIVATE',
    'WARRANTY_LOOKUP_OWN',
    'USER_VIEW',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'USER_PERMISSION_MANAGE',
    'SYSTEM_VIEW',
    'AUDIT_LOG_VIEW'
);

-- Rename user_role enum values by replacing the enum type. This keeps existing
-- data while moving the domain language from staff/user to moderator/customer.
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
CREATE TYPE "user_role_new" AS ENUM ('ADMIN', 'MODERATOR', 'CUSTOMER');
ALTER TABLE "user"
    ALTER COLUMN "role" TYPE "user_role_new"
    USING (
        CASE "role"::text
            WHEN 'STAFF' THEN 'MODERATOR'
            WHEN 'USER' THEN 'CUSTOMER'
            ELSE "role"::text
        END
    )::"user_role_new";
DROP TYPE "user_role";
ALTER TYPE "user_role_new" RENAME TO "user_role";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "user_permission" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "permission_key" "permission_key" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_permission_user_id_idx" ON "user_permission"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_user_id_permission_key_key" ON "user_permission"("user_id", "permission_key");

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
