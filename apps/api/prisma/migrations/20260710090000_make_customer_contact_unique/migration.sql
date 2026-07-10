-- Customer phone and email are used as quick lookup identifiers in Admin.
-- PostgreSQL unique indexes allow multiple NULL values, so customers can still omit either field.
CREATE UNIQUE INDEX "customer_phone_key" ON "customer"("phone");
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");
