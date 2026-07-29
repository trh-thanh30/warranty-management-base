ALTER TABLE "warranty"
ADD COLUMN "coverage_limit_amount" DECIMAL(18,2),
ADD COLUMN "max_claim_count" INTEGER,
ADD COLUMN "max_amount_per_claim" DECIMAL(18,2);

ALTER TABLE "warranty"
ADD CONSTRAINT "warranty_coverage_limit_amount_non_negative"
CHECK ("coverage_limit_amount" IS NULL OR "coverage_limit_amount" >= 0),
ADD CONSTRAINT "warranty_max_claim_count_positive"
CHECK ("max_claim_count" IS NULL OR "max_claim_count" > 0),
ADD CONSTRAINT "warranty_max_amount_per_claim_non_negative"
CHECK ("max_amount_per_claim" IS NULL OR "max_amount_per_claim" >= 0),
ADD CONSTRAINT "warranty_per_claim_within_total_limit"
CHECK (
  "max_amount_per_claim" IS NULL
  OR "coverage_limit_amount" IS NULL
  OR "max_amount_per_claim" <= "coverage_limit_amount"
);
