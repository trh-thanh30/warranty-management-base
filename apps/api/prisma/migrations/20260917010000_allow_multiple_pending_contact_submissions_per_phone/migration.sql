-- Temporarily allow multiple active contact messages from the same phone.
-- Keep the existing non-unique phone/status index for filtering and search.
DROP INDEX IF EXISTS "contact_submissions_pending_phone_unique";
