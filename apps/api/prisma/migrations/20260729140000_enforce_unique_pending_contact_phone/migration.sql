CREATE UNIQUE INDEX "contact_submissions_pending_phone_unique"
ON "contact_submissions" ("phone")
WHERE "status" IN ('NEW', 'IN_PROGRESS');
