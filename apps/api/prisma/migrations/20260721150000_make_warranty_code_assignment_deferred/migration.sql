-- Warranty codes are issued when a product receives its first owner.
ALTER TABLE "product" ALTER COLUMN "warranty_code" DROP NOT NULL;
ALTER TABLE "warranty" ALTER COLUMN "warranty_code" DROP NOT NULL;
