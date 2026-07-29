-- Phone and email identify a service center in Admin workflows.
-- PostgreSQL unique indexes still allow multiple NULL values.
CREATE UNIQUE INDEX "service_center_phone_key" ON "service_center"("phone");
CREATE UNIQUE INDEX "service_center_email_key" ON "service_center"("email");
