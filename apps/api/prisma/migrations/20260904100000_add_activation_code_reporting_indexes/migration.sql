CREATE INDEX "activation_code_status_created_at_idx"
  ON "activation_code"("status", "created_at");

CREATE INDEX "activation_code_created_at_idx"
  ON "activation_code"("created_at");

CREATE INDEX "warranty_activation_request_province_code_idx"
  ON "warranty_activation_request"("province_code");
