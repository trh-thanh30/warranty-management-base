ALTER TABLE "activation_code_print_job"
  ADD COLUMN "progress_percent" INTEGER NOT NULL DEFAULT 0;

UPDATE "activation_code_print_job"
SET "progress_percent" = CASE
  WHEN "status" = 'COMPLETED' THEN 100
  WHEN "status" = 'PROCESSING' THEN 10
  ELSE 0
END;

ALTER TABLE "activation_code_print_job"
  ADD CONSTRAINT "activation_code_print_job_progress_percent_check"
  CHECK ("progress_percent" >= 0 AND "progress_percent" <= 100);
