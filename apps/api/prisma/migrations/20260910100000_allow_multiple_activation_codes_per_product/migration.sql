-- A Product is a catalogue record and may have many physical activation-code assignments.
-- The latest historical migration restored a one-code-per-product index; remove it
-- without changing existing assignments.
DROP INDEX IF EXISTS "activation_code_product_id_key";
CREATE INDEX IF NOT EXISTS "activation_code_product_id_idx"
  ON "activation_code"("product_id");
