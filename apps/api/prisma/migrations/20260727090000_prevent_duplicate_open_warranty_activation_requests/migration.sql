DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "warranty_activation_request"
    WHERE
      "product_id" IS NOT NULL
      AND "status" IN ('PENDING', 'APPROVED')
    GROUP BY "product_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one open warranty activation request per product: duplicate open requests exist';
  END IF;
END
$$;

CREATE UNIQUE INDEX
  "warranty_activation_request_one_open_per_product"
ON "warranty_activation_request" ("product_id")
WHERE
  "product_id" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED');
