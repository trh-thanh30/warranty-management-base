import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Warranty activation request certificate contract', () => {
  const prismaSchemaPath = join(__dirname, '../../../../prisma/schema.prisma');
  const migrationPath = join(
    __dirname,
    '../../../../prisma/migrations/20260817090000_add_activation_request_certificate/migration.sql',
  );

  it('owns exactly one certificate without owning a Warranty', () => {
    const schema = readFileSync(prismaSchemaPath, 'utf8');
    const model = schema.match(
      /model WarrantyActivationRequestCertificate \{[\s\S]*?\n\}/,
    )?.[0];

    expect(model).toBeDefined();
    expect(model).toMatch(
      /activation_request_id\s+String\s+@unique\(map: "warranty_activation_request_certificate_activation_request_id_k"\)\s+@db\.Uuid/,
    );
    expect(model).toMatch(
      /activation_request\s+WarrantyActivationRequest\s+@relation\([^\n]*map: "warranty_activation_request_certificate_activation_request_id_f"\)/,
    );
    expect(model).not.toMatch(/warranty_id/);
    expect(schema).toMatch(
      /certificate\s+WarrantyActivationRequestCertificate\?/,
    );
  });

  it('ships a migration with matching explicit constraint names', () => {
    expect(existsSync(migrationPath)).toBe(true);

    const migration = readFileSync(migrationPath, 'utf8');
    expect(migration).toMatch(
      /CREATE TABLE "warranty_activation_request_certificate"/,
    );
    expect(migration).toContain(
      'CONSTRAINT "warranty_activation_request_certificate_activation_request_id_k" UNIQUE ("activation_request_id")',
    );
    expect(migration).toMatch(
      /CONSTRAINT "warranty_activation_request_certificate_activation_request_id_f"\s+FOREIGN KEY \("activation_request_id"\)/,
    );
  });
});
