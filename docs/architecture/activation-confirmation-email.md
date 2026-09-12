# Activation confirmation email

Warranty activation commits independently of PDF rendering and email delivery.

Set `CLIENT_WARRANTY_LOOKUP_URL` in the API environment to the customer-facing lookup URL. `client.config.ts` exposes it as `warrantyLookupUrl`, injected into the activation email service; a missing value is reported as an email configuration error rather than silently using a hardcoded domain.

- PDF generation succeeds: queue the existing certificate email with its PDF attachment.
- PDF generation fails: persist the certificate as `FAILED` and queue an activation confirmation without attachments. The email lists warranty codes and links to the warranty lookup page; it does not advertise an attached PDF.
- The worker sends either email through the existing queue/retry mechanism. No synchronous SMTP delivery is added to the review request.
- PDF status and email status are independent: a certificate may be `FAILED` while its email is `QUEUED` or `SENT`. Successful confirmation delivery preserves the PDF error.
- Automatic issuance/re-generation skips email when already `QUEUED` or `SENT`. Explicit Admin resend may force delivery and attempts to regenerate a failed PDF first; if rendering still fails, it can send the PDF-free confirmation again.
- `QUEUED` is persisted before enqueueing so a fast worker cannot have its `SENT` status overwritten. Actual delivery time is recorded by the worker, not at enqueue time.
- If persistence/queueing is unavailable, activation remains committed; errors are recorded/logged and the Admin can retry. This is not a transactional outbox or an exactly-once delivery guarantee.

The legacy single-warranty certificate flow is unchanged. The shared email template preserves the original PDF layout unless the explicit `withoutPdf` flag is set.
