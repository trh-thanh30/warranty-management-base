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
});
