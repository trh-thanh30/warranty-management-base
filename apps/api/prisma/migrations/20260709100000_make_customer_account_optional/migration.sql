-- Allow customer profiles to exist without a login account.
ALTER TABLE "customer" DROP CONSTRAINT "customer_user_id_fkey";
ALTER TABLE "customer" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Keep product ownership linked to customer profiles even when no user account exists.
ALTER TABLE "product_ownership" DROP CONSTRAINT "product_ownership_owner_user_id_fkey";
ALTER TABLE "product_ownership" ALTER COLUMN "owner_user_id" DROP NOT NULL;
ALTER TABLE "product_ownership" ADD CONSTRAINT "product_ownership_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
