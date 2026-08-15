import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Multi-product warranty activation contracts', () => {
  const sharedFieldTypesPath = join(
    __dirname,
    '../../../../../../packages/shared/src/types/category-activation-field.types.ts',
  );
  const prismaSchemaPath = join(__dirname, '../../../../prisma/schema.prisma');
  const migrationPath = join(
    __dirname,
    '../../../../prisma/migrations/20260815090000_add_category_activation_fields_and_request_items/migration.sql',
  );

  it('exposes a product-backed category activation field type', () => {
    const sharedFieldTypes = readFileSync(sharedFieldTypesPath, 'utf8');

    expect(sharedFieldTypes).toMatch(/"PRODUCT_SELECT"/);
  });

  it('models first-class activation fields and request items', () => {
    const schema = readFileSync(prismaSchemaPath, 'utf8');

    expect(schema).toMatch(/model CategoryActivationField \{/);
    expect(schema).toMatch(/model CategoryActivationFieldOption \{/);
    expect(schema).toMatch(/model WarrantyActivationRequestItem \{/);
    expect(schema).toMatch(
      /activation_form_enabled\s+Boolean\s+@default\(false\)/,
    );
    expect(schema).toMatch(/@@unique\(\[request_id, position_key\]\)/);
    expect(schema).toMatch(/@@unique\(\[request_id, product_id\]\)/);

    expect(schema).toMatch(/product_id\s+String\?\s+@db\.Uuid/);
    expect(schema).toMatch(
      /activated_warranty_id\s+String\?\s+@unique @db\.Uuid/,
    );
  });

  it('backfills legacy requests and protects open products in the migration', () => {
    expect(existsSync(migrationPath)).toBe(true);

    const migration = readFileSync(migrationPath, 'utf8');

    expect(migration).toMatch(/activationFields/);
    expect(migration).toMatch(/primaryProduct/);
    expect(migration).toMatch(/duplicate open/i);
    expect(migration).toMatch(
      /warranty_activation_request_item_one_open_per_product/,
    );
    expect(migration).toMatch(/WHERE\s+"status" IN \('PENDING', 'APPROVED'\)/);
  });
});
