CREATE TABLE "system_config" (
  "id" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updated_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
CREATE INDEX "system_config_updated_by_id_idx" ON "system_config"("updated_by_id");
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
