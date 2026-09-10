ALTER TABLE "warranty" ADD COLUMN "dealer_id" UUID;

CREATE TABLE "warranty_ownership" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "warranty_id" UUID NOT NULL,
  "customer_id" UUID NOT NULL,
  "owner_user_id" UUID,
  "purchase_date" TIMESTAMP(3),
  "activated_at" TIMESTAMP(3),
  "ended_at" TIMESTAMP(3),
  "is_current_owner" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "warranty_ownership_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "warranty_dealer_id_idx" ON "warranty"("dealer_id");
CREATE INDEX "warranty_ownership_warranty_id_is_current_owner_idx" ON "warranty_ownership"("warranty_id", "is_current_owner");
CREATE INDEX "warranty_ownership_customer_id_is_current_owner_idx" ON "warranty_ownership"("customer_id", "is_current_owner");
CREATE INDEX "warranty_ownership_owner_user_id_is_current_owner_idx" ON "warranty_ownership"("owner_user_id", "is_current_owner");

ALTER TABLE "warranty" ADD CONSTRAINT "warranty_dealer_id_fkey"
  FOREIGN KEY ("dealer_id") REFERENCES "dealer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "warranty_ownership" ADD CONSTRAINT "warranty_ownership_warranty_id_fkey"
  FOREIGN KEY ("warranty_id") REFERENCES "warranty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "warranty_ownership" ADD CONSTRAINT "warranty_ownership_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "warranty_ownership" ADD CONSTRAINT "warranty_ownership_owner_user_id_fkey"
  FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "warranty" w
SET "dealer_id" = r."dealer_id"
FROM "warranty_activation_request" r
WHERE r."activated_warranty_id" = w."id"
  AND r."dealer_id" IS NOT NULL;

INSERT INTO "warranty_ownership" (
  "warranty_id", "customer_id", "owner_user_id", "purchase_date",
  "activated_at", "is_current_owner", "updated_at"
)
SELECT
  w."id", po."customer_id", po."owner_user_id", po."purchase_date",
  po."activated_at", po."is_current_owner", CURRENT_TIMESTAMP
FROM "warranty" w
JOIN "product" p ON p."current_warranty_id" = w."id"
JOIN "product_ownership" po
  ON po."product_id" = p."id" AND po."is_current_owner" = true
WHERE NOT EXISTS (
  SELECT 1 FROM "warranty_ownership" wo WHERE wo."warranty_id" = w."id"
);

INSERT INTO "warranty_ownership" (
  "warranty_id", "customer_id", "purchase_date", "activated_at",
  "is_current_owner", "updated_at"
)
SELECT
  w."id", r."customer_id", w."start_date", w."start_date",
  true, CURRENT_TIMESTAMP
FROM "warranty" w
JOIN "warranty_activation_request" r
  ON r."activated_warranty_id" = w."id"
WHERE r."customer_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "warranty_ownership" wo WHERE wo."warranty_id" = w."id"
  );
