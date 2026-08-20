ALTER TABLE "product_template"
ALTER COLUMN "default_warranty_duration_months" DROP DEFAULT,
ALTER COLUMN "default_warranty_duration_months" DROP NOT NULL;
