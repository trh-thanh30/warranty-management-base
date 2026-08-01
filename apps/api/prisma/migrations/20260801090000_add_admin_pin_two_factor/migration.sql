CREATE TYPE "admin_two_factor_method" AS ENUM ('EMAIL_OTP', 'PIN');

ALTER TABLE "user"
  ADD COLUMN "two_factor_method" "admin_two_factor_method" NOT NULL DEFAULT 'EMAIL_OTP',
  ADD COLUMN "pin_hash" TEXT;
