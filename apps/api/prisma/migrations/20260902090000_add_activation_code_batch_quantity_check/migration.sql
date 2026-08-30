ALTER TABLE "activation_code_batch"
  ADD CONSTRAINT "activation_code_batch_quantity_check"
  CHECK ("quantity" BETWEEN 50 AND 1000);
