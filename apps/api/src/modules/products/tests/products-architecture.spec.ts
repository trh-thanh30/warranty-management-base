import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Products architecture', () => {
  it('keeps create-product persistence behind the repository', () => {
    const source = readFileSync(
      join(__dirname, '../use-cases/create-product.use-case.ts'),
      'utf8',
    );

    expect(source).not.toContain('PrismaService');
    expect(source).not.toContain('prismaService');
    expect(source).not.toContain('$transaction');
    expect(source).not.toContain('tx.product');
    expect(source).toContain('productsRepository.create');
  });

  it('keeps Product Template outside active product and warranty runtime paths', () => {
    const runtimeFiles = [
      '../product-catalogue.ts',
      '../products.types.ts',
      '../repository/products.repository.ts',
      '../../analytics/repository/analytics.repository.ts',
      '../../warranties/repository/warranties.repository.ts',
      '../../warranties/repository/warranty-transaction.repository.ts',
      '../../warranties/warranties.types.ts',
      '../../warranty-certificates/repository/warranty-certificates.repository.ts',
      '../../warranty-claims/repository/warranty-claims.repository.ts',
      '../../warranty-claims/repository/warranty-claims.repository.queries.ts',
      '../../../app.module.ts',
      '../../../../prisma/seed.ts',
      '../../../../prisma/seed-products.ts',
    ];

    for (const relativePath of runtimeFiles) {
      const source = readFileSync(join(__dirname, relativePath), 'utf8');

      expect(source).not.toContain('ProductTemplate');
      expect(source).not.toContain('productTemplate');
      expect(source).not.toContain('template_id');
      expect(source).not.toMatch(/\btemplate:\s*(?:true|\{)/);
      expect(source).not.toContain('.template?.');
    }
  });
});
