CREATE TYPE "contact_submission_status" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED');

ALTER TYPE "permission_key" ADD VALUE 'CONTACT_SUBMISSION_VIEW';
ALTER TYPE "permission_key" ADD VALUE 'CONTACT_SUBMISSION_UPDATE';

CREATE TABLE "contact_submissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "full_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "contact_submission_status" NOT NULL DEFAULT 'NEW',
  "source_path" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_submissions_status_created_at_idx" ON "contact_submissions"("status", "created_at");
CREATE INDEX "contact_submissions_phone_status_created_at_idx" ON "contact_submissions"("phone", "status", "created_at");
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions"("created_at");
