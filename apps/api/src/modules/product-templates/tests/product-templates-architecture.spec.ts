import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Product templates architecture', () => {
  it('keeps category database access behind the repository', () => {
    const applicationFiles = [
      '../product-template-input.ts',
      '../use-cases/create-product-template.use-case.ts',
      '../use-cases/update-product-template.use-case.ts',
    ];

    for (const relativePath of applicationFiles) {
      const source = readFileSync(join(__dirname, relativePath), 'utf8');

      expect(source).not.toContain('PrismaService');
      expect(source).not.toContain('prismaService');
    }
  });
});
