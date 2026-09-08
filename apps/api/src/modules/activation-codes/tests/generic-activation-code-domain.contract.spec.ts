import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Generic activation code pool domain contract', () => {
  const schemaPath = join(__dirname, '../../../../prisma/schema.prisma');
  const migrationPath = join(
    __dirname,
    '../../../../prisma/migrations/20260906120000_generic_activation_code_pool_domain/migration.sql',
  );
  const categorySeedPath = join(
    __dirname,
    '../../../../prisma/seed-categories.ts',
  );

  it('allows generic batches while retaining nullable legacy product snapshots', () => {
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toMatch(/product_sku\s+String\?/);
    expect(schema).toMatch(/product_name\s+String\?/);
    expect(schema).toMatch(/warranty_duration_months\s+Int\?/);
    expect(schema).toMatch(/warranty_method\s+warranty_method\?/);
  });

  it('models many warranties per product and one warranty per activation code', () => {
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toMatch(/warranties\s+Warranty\[\]/);
    expect(schema).toMatch(
      /activation_codes\s+ActivationCode\[\]\s+@relation\("ActivationCodeProduct"\)/,
    );
    expect(schema).toMatch(/product_id\s+String\?\s+@db\.Uuid/);
    expect(schema).not.toMatch(/product_id\s+String\s+@unique\s+@db\.Uuid/);
    expect(schema).toMatch(
      /activation_code_id\s+String\?\s+@unique\s+@db\.Uuid/,
    );
    expect(schema).toMatch(
      /activation_code\s+ActivationCode\?\s+@relation\("ActivationCodeWarranty"/,
    );
  });

  it('removes the historical one-code-per-product index without touching assignments', () => {
    const migrationPath = join(
      __dirname,
      '../../../../prisma/migrations/20260910100000_allow_multiple_activation_codes_per_product/migration.sql',
    );
    expect(existsSync(migrationPath)).toBe(true);
    const migration = readFileSync(migrationPath, 'utf8');

    expect(migration).toMatch(
      /DROP INDEX IF EXISTS "activation_code_product_id_key"/,
    );
    expect(migration).toMatch(
      /CREATE INDEX IF NOT EXISTS "activation_code_product_id_idx"/,
    );
    expect(migration).not.toMatch(/UPDATE\s+"activation_code"/);
  });

  it('allows pending request items to select the same product with different codes', () => {
    const schema = readFileSync(schemaPath, 'utf8');

    expect(schema).toMatch(/activation_code_id\s+String\?\s+@db\.Uuid/);
    expect(schema).toMatch(/warranty_id\s+String\?\s+@db\.Uuid/);
    expect(schema).toMatch(/warranty_code\s+String\?/);
    expect(schema).not.toMatch(/@@unique\(\[request_id, product_id\]\)/);
    expect(schema).toMatch(/@@index\(\[activation_code_id, status\]\)/);
  });

  it('ships a compatibility migration with backfill and database constraints', () => {
    expect(existsSync(migrationPath)).toBe(true);
    const migration = readFileSync(migrationPath, 'utf8');

    expect(migration).toMatch(/DROP INDEX "warranty_product_id_key"/);
    expect(migration).toMatch(/DROP INDEX "activation_code_product_id_key"/);
    expect(migration).toMatch(/ADD COLUMN "activation_code_id" UUID/);
    expect(migration).toMatch(
      /SET "activation_code_id" = "request"\."activation_code_id"/,
    );
    expect(migration).toMatch(/activation_code_enabled/);
    expect(migration).not.toMatch(/LEXZENZ_REFLEX_KOREA_FILM/);
  });

  it('seeds Film as ineligible without matching its display name', () => {
    const categorySeed = readFileSync(categorySeedPath, 'utf8');

    expect(categorySeed).toMatch(/activationCodeEnabled/);
    expect(categorySeed).toMatch(/activation_code_enabled/);
    expect(categorySeed).toMatch(/LEXZENZ_REFLEX_KOREA_FILM/);
  });

  it('allows duplicate customer and dealer recipient emails', () => {
    const schema = readFileSync(schemaPath, 'utf8');
    const customerModel = schema.slice(
      schema.indexOf('model Customer {'),
      schema.indexOf('model Category {'),
    );
    const dealerModel = schema.slice(
      schema.indexOf('model Dealer {'),
      schema.indexOf('model SystemConfig {'),
    );

    expect(customerModel).toMatch(/email\s+String\?/);
    expect(customerModel).toMatch(/@@index\(\[email\]\)/);
    expect(customerModel).not.toMatch(/email\s+String\?\s+@unique/);
    expect(dealerModel).toMatch(/email\s+String\?/);
    expect(dealerModel).not.toMatch(/email\s+String\?\s+@unique/);
  });
});
