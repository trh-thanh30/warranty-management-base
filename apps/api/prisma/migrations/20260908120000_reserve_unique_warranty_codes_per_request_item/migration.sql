DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "warranty_activation_request_item"
    WHERE "warranty_code" IS NOT NULL
    GROUP BY "warranty_code"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      MESSAGE = 'Cannot enforce unique request-item warranty codes because duplicate reserved codes exist',
      HINT = 'Assign a distinct warranty_code to every duplicated warranty_activation_request_item before retrying this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX "warranty_activation_request_item_warranty_code_key"
ON "warranty_activation_request_item"("warranty_code");
