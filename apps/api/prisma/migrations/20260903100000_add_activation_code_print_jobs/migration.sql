CREATE TYPE "activation_code_print_job_status" AS ENUM (
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED'
);

CREATE TABLE "activation_code_print_job" (
  "id" UUID NOT NULL,
  "batch_id" UUID NOT NULL,
  "requested_by_id" UUID NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "status" "activation_code_print_job_status" NOT NULL DEFAULT 'QUEUED',
  "from_index" INTEGER NOT NULL,
  "to_index" INTEGER NOT NULL,
  "bull_job_id" TEXT,
  "storage_key" TEXT,
  "filename" TEXT,
  "error_message" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "activation_code_print_job_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "activation_code_print_job_range_check"
    CHECK ("from_index" >= 1 AND "to_index" >= "from_index" AND "to_index" <= 1000)
);

CREATE UNIQUE INDEX "activation_code_print_job_idempotency_key_key"
  ON "activation_code_print_job"("idempotency_key");
CREATE UNIQUE INDEX "activation_code_print_job_bull_job_id_key"
  ON "activation_code_print_job"("bull_job_id");
CREATE INDEX "activation_code_print_job_batch_id_created_at_idx"
  ON "activation_code_print_job"("batch_id", "created_at");
CREATE INDEX "activation_code_print_job_status_created_at_idx"
  ON "activation_code_print_job"("status", "created_at");

ALTER TABLE "activation_code_print_job"
  ADD CONSTRAINT "activation_code_print_job_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "activation_code_batch"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activation_code_print_job"
  ADD CONSTRAINT "activation_code_print_job_requested_by_id_fkey"
  FOREIGN KEY ("requested_by_id") REFERENCES "user"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
