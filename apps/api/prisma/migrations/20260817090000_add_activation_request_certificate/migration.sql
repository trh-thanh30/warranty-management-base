CREATE TABLE "warranty_activation_request_certificate" (
    "id" UUID NOT NULL,
    "activation_request_id" UUID NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "warranty_certificate_status" NOT NULL DEFAULT 'PENDING',
    "storage_key" TEXT,
    "recipient_email" TEXT,
    "generated_at" TIMESTAMP(3),
    "emailed_at" TIMESTAMP(3),
    "email_status" "warranty_certificate_email_status" NOT NULL DEFAULT 'PENDING',
    "last_error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_activation_request_certificate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "warranty_activation_request_certificate_activation_request_id_k" UNIQUE ("activation_request_id"),
    CONSTRAINT "warranty_activation_request_certificate_certificate_number_key" UNIQUE ("certificate_number")
);

CREATE INDEX "warranty_activation_request_certificate_certificate_number_idx"
ON "warranty_activation_request_certificate"("certificate_number");

CREATE INDEX "warranty_activation_request_certificate_status_idx"
ON "warranty_activation_request_certificate"("status");

CREATE INDEX "warranty_activation_request_certificate_email_status_idx"
ON "warranty_activation_request_certificate"("email_status");

CREATE INDEX "warranty_activation_request_certificate_recipient_email_idx"
ON "warranty_activation_request_certificate"("recipient_email");

ALTER TABLE "warranty_activation_request_certificate"
ADD CONSTRAINT "warranty_activation_request_certificate_activation_request_id_f"
FOREIGN KEY ("activation_request_id")
REFERENCES "warranty_activation_request"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
