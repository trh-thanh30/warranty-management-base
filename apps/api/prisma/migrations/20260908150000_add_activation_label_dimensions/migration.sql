ALTER TABLE "activation_code_print_job"
  ADD COLUMN "label_width_mm" DOUBLE PRECISION NOT NULL DEFAULT 45.7,
  ADD COLUMN "label_height_mm" DOUBLE PRECISION NOT NULL DEFAULT 16.9;

ALTER TABLE "activation_code_print_job"
  ADD CONSTRAINT "activation_code_print_job_label_width_check"
    CHECK ("label_width_mm" >= 30 AND "label_width_mm" <= 182.8),
  ADD CONSTRAINT "activation_code_print_job_label_height_check"
    CHECK ("label_height_mm" >= 12 AND "label_height_mm" <= 270.4);
