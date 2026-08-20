-- AlterTable
ALTER TABLE "category_activation_field" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "category_activation_field_option" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "contact_submissions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "warranty_activation_request_item" ALTER COLUMN "updated_at" DROP DEFAULT;
