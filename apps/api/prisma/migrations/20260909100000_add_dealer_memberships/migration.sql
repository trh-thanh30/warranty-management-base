CREATE TABLE "dealer_membership" (
  "id" UUID NOT NULL,
  "dealer_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "dealer_membership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dealer_membership_dealer_id_user_id_key"
  ON "dealer_membership"("dealer_id", "user_id");
CREATE INDEX "dealer_membership_user_id_idx"
  ON "dealer_membership"("user_id");
CREATE INDEX "dealer_membership_dealer_id_idx"
  ON "dealer_membership"("dealer_id");
CREATE INDEX "dealer_membership_created_by_id_idx"
  ON "dealer_membership"("created_by_id");

ALTER TABLE "dealer_membership"
  ADD CONSTRAINT "dealer_membership_dealer_id_fkey"
  FOREIGN KEY ("dealer_id") REFERENCES "dealer"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dealer_membership"
  ADD CONSTRAINT "dealer_membership_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dealer_membership"
  ADD CONSTRAINT "dealer_membership_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
