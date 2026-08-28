export interface EmailJobData {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    contentBase64: string;
    contentType: string;
    filename: string;
  }>;
  template?: string;
  context?: Record<string, unknown>;
  warrantyCertificateId?: string;
  warrantyCertificateIds?: string[];
  warrantyActivationRequestCertificateId?: string;
  // Idempotency key for deduplication
  idempotencyKey?: string;
}
